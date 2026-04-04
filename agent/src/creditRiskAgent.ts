import { config, createAgentClient } from "./agentClient.js";

/**
 * Credit Risk Agent
 *
 * Triggered by the backend when a PSP requests a drawdown.
 * Autonomously buys data from 3 sources via nanopayments:
 *   1. Pool Monitor Agent → pool health context ($0.003)
 *   2. Data Service → credit score ($0.01)
 *   3. Data Service → compliance check ($0.005)
 *
 * Combines all data into a risk assessment and returns it.
 * Total cost per assessment: $0.018
 */

export interface CreditRiskAssessment {
  pspAddress: string;
  creditScore: number;
  complianceStatus: string;
  poolHealthContext: {
    utilizationRate: number;
    liquidityRisk: string;
    canHandleDrawdown: boolean;
  };
  overallRiskScore: number; // 0-100
  overallRating: string; // AAA | AA | A | B/C
  recommendation: string; // "approve" | "reduced_limit" | "manual_review" | "decline"
  totalCost: string; // total nanopayment cost
  dataSources: string[];
  timestamp: string;
}

export async function assessCreditRisk(pspAddress: string): Promise<CreditRiskAssessment> {
  const client = await createAgentClient();
  const dataSources: string[] = [];

  // Step 1: Buy pool health from Pool Monitor Agent ($0.003)
  console.log("[credit-risk] Step 1: Paying Pool Monitor $0.003 for pool health...");
  let poolHealth: any;
  try {
    const poolRes = await client.pay(`${config.POOL_MONITOR_URL}/api/agent/pool-health`);
    poolHealth = (poolRes.data as any).analysis;
    dataSources.push("Pool Monitor Agent ($0.003)");
    console.log(`[credit-risk] Pool health: util=${poolHealth.utilizationRate}% risk=${poolHealth.liquidityRisk}`);
  } catch (err: any) {
    console.log("[credit-risk] Pool Monitor unavailable, using defaults:", err.message);
    poolHealth = {
      utilizationRate: 50,
      liquidityRisk: "medium",
      canHandleDrawdown: true,
      reserveHealth: "healthy",
    };
  }

  // Step 2: Buy credit score from Data Service ($0.01)
  console.log("[credit-risk] Step 2: Paying Data Service $0.01 for credit score...");
  let creditData: any;
  try {
    const creditRes = await client.pay(
      `${config.DATA_SERVICE_URL}/api/agent/credit-score?pspAddress=${pspAddress}`
    );
    creditData = creditRes.data as any;
    dataSources.push("Credit Bureau ($0.01)");
    console.log(`[credit-risk] Credit score: ${creditData.score}/100 — ${creditData.financialHealth}`);
  } catch (err: any) {
    console.log("[credit-risk] Credit service unavailable:", err.message);
    creditData = { score: 60, financialHealth: "adequate", factors: [] };
  }

  // Step 3: Buy compliance check from Data Service ($0.005)
  console.log("[credit-risk] Step 3: Paying Data Service $0.005 for compliance check...");
  let complianceData: any;
  try {
    const compRes = await client.pay(
      `${config.DATA_SERVICE_URL}/api/agent/compliance-check?pspAddress=${pspAddress}`
    );
    complianceData = compRes.data as any;
    dataSources.push("Compliance Screening ($0.005)");
    console.log(`[credit-risk] Compliance: ${complianceData.status}`);
  } catch (err: any) {
    console.log("[credit-risk] Compliance service unavailable:", err.message);
    complianceData = { status: "review", sanctions: false, pep: false };
  }

  // Step 4: Combine into risk assessment
  let overallScore = creditData.score;

  // Adjust based on compliance
  if (complianceData.status === "fail") overallScore -= 30;
  else if (complianceData.status === "review") overallScore -= 10;

  // Adjust based on pool health
  if (poolHealth.liquidityRisk === "high") overallScore -= 5;
  if (!poolHealth.canHandleDrawdown) overallScore -= 15;

  // Clamp
  overallScore = Math.max(0, Math.min(100, overallScore));

  // Rating bands (matching KYR bands)
  let rating: string;
  let recommendation: string;
  if (overallScore >= 85) {
    rating = "AAA";
    recommendation = "approve";
  } else if (overallScore >= 70) {
    rating = "AA";
    recommendation = "approve";
  } else if (overallScore >= 55) {
    rating = "A";
    recommendation = "reduced_limit";
  } else {
    rating = "B/C";
    recommendation = complianceData.status === "fail" ? "decline" : "manual_review";
  }

  const assessment: CreditRiskAssessment = {
    pspAddress,
    creditScore: creditData.score,
    complianceStatus: complianceData.status,
    poolHealthContext: {
      utilizationRate: poolHealth.utilizationRate,
      liquidityRisk: poolHealth.liquidityRisk,
      canHandleDrawdown: poolHealth.canHandleDrawdown,
    },
    overallRiskScore: overallScore,
    overallRating: rating,
    recommendation,
    totalCost: "$0.018",
    dataSources,
    timestamp: new Date().toISOString(),
  };

  console.log(`[credit-risk] Assessment complete: ${overallScore}/100 (${rating}) → ${recommendation}`);
  return assessment;
}

// Run standalone for testing
async function main() {
  const testAddress = process.argv[2] || "0xTestPSP123";
  console.log(`\nRunning Credit Risk Assessment for: ${testAddress}\n`);

  const result = await assessCreditRisk(testAddress);
  console.log("\nFull Assessment:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
