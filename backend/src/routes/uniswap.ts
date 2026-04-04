import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";

const router = Router();

const UNISWAP_API = "https://trade-api.gateway.uniswap.org/v1";
const API_KEY = process.env.UNISWAP_API_KEY || "";

// Base mainnet token addresses (where Uniswap has liquidity)
const TOKENS: Record<string, { address: string; chainId: number; decimals: number }> = {
  USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", chainId: 8453, decimals: 6 },
  EURC: { address: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42", chainId: 8453, decimals: 6 },
  WETH: { address: "0x4200000000000000000000000000000000000006", chainId: 8453, decimals: 18 },
};

// GET /api/uniswap/rates — live conversion rates
router.get("/rates", authenticate, async (_req: Request, res: Response) => {
  try {
    const pairs = [
      { from: "EURC", to: "USDC", amount: "1000000" },
      { from: "WETH", to: "USDC", amount: "1000000000000000" }, // 0.001 ETH
    ];

    const rates: Record<string, { rate: number; inputAmount: string; outputAmount: string }> = {};

    for (const pair of pairs) {
      const fromToken = TOKENS[pair.from];
      const toToken = TOKENS[pair.to];
      if (!fromToken || !toToken) continue;

      try {
        const resp = await fetch(`${UNISWAP_API}/quote`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
          body: JSON.stringify({
            tokenIn: fromToken.address,
            tokenInChainId: fromToken.chainId,
            tokenOut: toToken.address,
            tokenOutChainId: toToken.chainId,
            amount: pair.amount,
            type: "EXACT_INPUT",
            swapper: "0x0000000000000000000000000000000000000001",
            slippageTolerance: 0.5,
            routingPreference: "BEST_PRICE",
          }),
        });

        const data = await resp.json() as any;

        if (data.quote) {
          const amtIn = Number(data.quote.input?.amount || 0);
          const amtOut = Number(data.quote.output?.amount || 0);
          rates[`${pair.from}/USDC`] = {
            rate: amtIn > 0 ? amtOut / amtIn : 0,
            inputAmount: data.quote.input?.amount || "0",
            outputAmount: data.quote.output?.amount || "0",
          };
        }
      } catch {}
    }

    res.json({
      rates,
      source: "Uniswap Trading API",
      chain: "Base (8453)",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Uniswap rates error:", err.message);
    res.status(500).json({ error: "Failed to fetch rates" });
  }
});

// POST /api/uniswap/quote — get specific conversion quote
router.post("/quote", authenticate, async (req: Request, res: Response) => {
  try {
    const { tokenIn, tokenOut, amount, type } = req.body;

    const fromToken = TOKENS[tokenIn];
    const toToken = TOKENS[tokenOut];
    if (!fromToken || !toToken) {
      res.status(400).json({ error: "Invalid token pair" });
      return;
    }

    const resp = await fetch(`${UNISWAP_API}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      body: JSON.stringify({
        tokenIn: fromToken.address,
        tokenInChainId: fromToken.chainId,
        tokenOut: toToken.address,
        tokenOutChainId: toToken.chainId,
        amount,
        type: type || "EXACT_INPUT",
        swapper: "0x0000000000000000000000000000000000000001",
        slippageTolerance: 0.5,
        routingPreference: "BEST_PRICE",
      }),
    });

    const data = await resp.json() as any;

    if (data.quote) {
      res.json({
        input: data.quote.input,
        output: data.quote.output,
        gasEstimate: data.quote.gasEstimate,
        route: data.routing,
        source: "Uniswap Trading API",
      });
    } else {
      res.json({ error: data.detail || "No quote available", raw: data });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Quote failed" });
  }
});

export default router;
