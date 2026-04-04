import express from "express";
import { config } from "./agentClient.js";

const app = express();
const PORT = 4001;

/**
 * External Data Service — Sell Side
 *
 * Simulates real-world paid APIs (credit bureaus, compliance screening, market data).
 * Each endpoint is protected by Circle x402 nanopayment middleware.
 * In production, these would be actual external API integrations.
 */

async function startServer() {
  // Dynamic import for ESM compatibility
  const { createGatewayMiddleware } = await import("@circle-fin/x402-batching/server");

  const gateway = createGatewayMiddleware({
    sellerAddress: config.SELLER_WALLET_ADDRESS as `0x${string}`,
    networks: ["eip155:5042002"], // Arc Testnet only
  });

  /**
   * Credit Score Endpoint — $0.01 per query
   * Returns a PSP credit assessment based on their wallet address.
   * Mock: deterministic score derived from address for consistency.
   */
  app.get("/api/agent/credit-score", gateway.require("$0.01"), (req, res) => {
    const pspAddress = req.query.pspAddress as string || "unknown";
    const { payer } = (req as any).payment!;

    // Deterministic mock: hash the address to get a consistent score
    const hash = simpleHash(pspAddress);
    const score = 55 + (hash % 40); // range 55-94
    const factors = [];

    if (score >= 80) factors.push("strong payment history", "high transaction volume", "tier-1 banking partners");
    else if (score >= 65) factors.push("adequate payment history", "moderate volume", "standard banking partners");
    else factors.push("limited history", "low volume", "unrated partners");

    console.log(`[credit-score] Paid by ${payer} | PSP: ${pspAddress} | Score: ${score}`);

    res.json({
      payer,
      pspAddress,
      score,
      maxScore: 100,
      factors,
      financialHealth: score >= 80 ? "strong" : score >= 65 ? "adequate" : "weak",
      dataSource: "PayMate Credit Bureau (simulated)",
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Compliance Check Endpoint — $0.005 per query
   * Returns KYB/sanctions/PEP screening result.
   * Mock: most addresses pass, specific patterns fail.
   */
  app.get("/api/agent/compliance-check", gateway.require("$0.005"), (req, res) => {
    const pspAddress = req.query.pspAddress as string || "unknown";
    const { payer } = (req as any).payment!;

    // Mock: 95% pass rate
    const hash = simpleHash(pspAddress);
    const sanctionsHit = hash % 20 === 0; // 5% fail rate
    const pepHit = hash % 50 === 0; // 2% PEP match

    const status = sanctionsHit ? "fail" : pepHit ? "review" : "pass";

    console.log(`[compliance] Paid by ${payer} | PSP: ${pspAddress} | Status: ${status}`);

    res.json({
      payer,
      pspAddress,
      status,
      sanctions: sanctionsHit,
      pep: pepHit,
      adverseMedia: false,
      jurisdiction: "cleared",
      screeningProvider: "ComplyAdvantage (simulated)",
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Market Data Endpoint — $0.002 per query
   * Returns current stablecoin market data and pool benchmarks.
   * Mock: realistic-looking DeFi metrics.
   */
  app.get("/api/agent/market-data", gateway.require("$0.002"), (_req, res) => {
    const { payer } = (_req as any).payment!;

    // Slightly randomized to look realistic
    const baseUtilization = 0.55 + Math.random() * 0.25; // 55-80%
    const usdcLiquidity = 800_000_000 + Math.floor(Math.random() * 400_000_000);

    console.log(`[market-data] Paid by ${payer}`);

    res.json({
      payer,
      usdcTotalLiquidity: usdcLiquidity.toString(),
      averagePoolUtilization: parseFloat(baseUtilization.toFixed(4)),
      usdcUsdRate: 1.0000,
      eurcUsdRate: 1.0842 + Math.random() * 0.005,
      averageLendingAPY: 4.8 + Math.random() * 2, // 4.8-6.8%
      averageBorrowRate: 6.2 + Math.random() * 3, // 6.2-9.2%
      dataSource: "DeFi Llama (simulated)",
      timestamp: new Date().toISOString(),
    });
  });

  // Health check (free — no payment required)
  app.get("/api/agent/health", (_req, res) => {
    res.json({ status: "ok", service: "PayMate Data Service", port: PORT });
  });

  app.listen(PORT, () => {
    console.log(`Data Service running on port ${PORT}`);
    console.log(`  Seller wallet: ${config.SELLER_WALLET_ADDRESS}`);
    console.log(`  Endpoints:`);
    console.log(`    GET /api/agent/credit-score     ($0.01)`);
    console.log(`    GET /api/agent/compliance-check  ($0.005)`);
    console.log(`    GET /api/agent/market-data       ($0.002)`);
  });
}

/** Simple deterministic hash for consistent mock data */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

startServer().catch(console.error);
