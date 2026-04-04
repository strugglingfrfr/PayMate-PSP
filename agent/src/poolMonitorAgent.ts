import express from "express";
import { config, createAgentClient } from "./agentClient.js";

const PORT = 4002;
const app = express();

/**
 * Pool Monitor Agent
 *
 * BUYER: Pays $0.002 to external data service for raw market data every hour.
 * SELLER: Sells processed pool health analysis to other agents for $0.003.
 *
 * This agent is both a consumer and a producer — it buys raw data, processes it
 * into pool-specific intelligence, and resells that intelligence to Credit Risk
 * and Repayment Reminder agents.
 */

// Cached analysis — updated every time the agent fetches new market data
let latestAnalysis: PoolHealthAnalysis | null = null;

interface PoolHealthAnalysis {
  utilizationRate: number;
  reserveHealth: string; // "healthy" | "low" | "critical"
  liquidityRisk: string; // "low" | "medium" | "high"
  marketComparison: string; // "competitive" | "above_market" | "below_market"
  canHandleDrawdown: boolean;
  maxSafeDrawdown: string;
  marketAvgAPY: number;
  marketAvgBorrowRate: number;
  updatedAt: string;
}

/**
 * BUY SIDE: Fetch market data from external data service and compute pool analysis.
 * Called on a schedule (every hour) or on-demand.
 */
export async function fetchAndAnalyze(poolState?: {
  totalLiquidity: string;
  availableLiquidity: string;
  investorAPY: number;
  pspRatePerDay: number;
}): Promise<PoolHealthAnalysis> {
  const client = await createAgentClient();
  const url = `${config.DATA_SERVICE_URL}/api/agent/market-data`;

  console.log("[pool-monitor] Paying $0.002 for market data...");
  const { data } = await client.pay(url);
  const marketData = data as any;
  console.log("[pool-monitor] Market data received:", JSON.stringify(marketData).slice(0, 100));

  // If we have real pool state from the backend DB, use it
  // Otherwise use defaults for standalone operation
  const totalLiq = BigInt(poolState?.totalLiquidity || "50000000000");
  const availLiq = BigInt(poolState?.availableLiquidity || "35000000000");
  const ourAPY = (poolState?.investorAPY || 500) / 100; // basis points to %
  const ourRate = (poolState?.pspRatePerDay || 50) / 100;

  const utilization = totalLiq > 0n
    ? Number((totalLiq - availLiq) * 10000n / totalLiq) / 100
    : 0;

  const reserveHealth = utilization < 60 ? "healthy" : utilization < 80 ? "low" : "critical";
  const liquidityRisk = utilization < 50 ? "low" : utilization < 75 ? "medium" : "high";

  const marketAvgAPY = marketData.averageLendingAPY || 5.0;
  const marketComparison = ourAPY > marketAvgAPY + 1
    ? "above_market"
    : ourAPY < marketAvgAPY - 1
      ? "below_market"
      : "competitive";

  const maxSafe = availLiq > 10000000000n ? availLiq - 10000000000n : 0n; // keep 10K reserve

  latestAnalysis = {
    utilizationRate: utilization,
    reserveHealth,
    liquidityRisk,
    marketComparison,
    canHandleDrawdown: availLiq > 0n,
    maxSafeDrawdown: maxSafe.toString(),
    marketAvgAPY,
    marketAvgBorrowRate: marketData.averageBorrowRate || 7.0,
    updatedAt: new Date().toISOString(),
  };

  console.log(`[pool-monitor] Analysis: util=${utilization}% reserve=${reserveHealth} risk=${liquidityRisk}`);
  return latestAnalysis;
}

/**
 * SELL SIDE: Other agents pay $0.003 to get the latest pool health analysis.
 */
async function startSellSide() {
  const { createGatewayMiddleware } = await import("@circle-fin/x402-batching/server");

  const gateway = createGatewayMiddleware({
    sellerAddress: config.SELLER_WALLET_ADDRESS as `0x${string}`,
    networks: ["eip155:5042002"],
  });

  app.get("/api/agent/pool-health", gateway.require("$0.003"), (_req, res) => {
    const { payer } = (_req as any).payment!;

    console.log(`[pool-monitor] Selling pool analysis to ${payer}`);

    if (!latestAnalysis) {
      res.status(503).json({ error: "No analysis available yet. Agent is warming up." });
      return;
    }

    res.json({
      payer,
      analysis: latestAnalysis,
    });
  });

  // Health check (free)
  app.get("/api/agent/pool-monitor/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Pool Monitor Agent",
      hasAnalysis: latestAnalysis !== null,
      lastUpdate: latestAnalysis?.updatedAt || null,
    });
  });

  app.listen(PORT, () => {
    console.log(`Pool Monitor Agent running on port ${PORT}`);
    console.log(`  Sell endpoint: GET /api/agent/pool-health ($0.003)`);
  });
}

/**
 * Run the Pool Monitor Agent as a standalone service.
 * Starts the sell side server and runs the first analysis.
 */
async function main() {
  await startSellSide();

  // Initial fetch
  try {
    await fetchAndAnalyze();
  } catch (err: any) {
    console.log("[pool-monitor] Initial fetch failed (data service may not be running):", err.message);
    // Generate a default analysis so sell side has something
    latestAnalysis = {
      utilizationRate: 0,
      reserveHealth: "healthy",
      liquidityRisk: "low",
      marketComparison: "competitive",
      canHandleDrawdown: true,
      maxSafeDrawdown: "40000000000",
      marketAvgAPY: 5.0,
      marketAvgBorrowRate: 7.0,
      updatedAt: new Date().toISOString(),
    };
  }

  // Schedule hourly updates
  setInterval(async () => {
    try {
      await fetchAndAnalyze();
    } catch (err: any) {
      console.log("[pool-monitor] Scheduled fetch failed:", err.message);
    }
  }, 60 * 60 * 1000);
}

// Export for use by backend integration
export { latestAnalysis };

// Run standalone if executed directly
main().catch(console.error);
