"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface RateInfo {
  rate: number;
  inputAmount: string;
  outputAmount: string;
}

export function UniswapRates({ compact = false }: { compact?: boolean }) {
  const [rates, setRates] = useState<Record<string, RateInfo>>({});
  const [loading, setLoading] = useState(true);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/uniswap/rates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        setRates(d.rates || {});
        setTimestamp(d.timestamp || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const eurcRate = rates["EURC/USDC"]?.rate;

  if (loading) return null;
  if (!eurcRate) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">EURC/USDC</span>
        <span className="font-mono text-foreground">{eurcRate.toFixed(4)}</span>
        <span className="text-muted-foreground/50">via Uniswap</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium uppercase tracking-widest text-blue-400">Live Rates</div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">via Uniswap</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-400/10 text-[10px] font-medium text-blue-400">€</span>
            <span className="text-sm text-foreground">EURC → USDC</span>
          </div>
          <span className="text-sm font-mono text-foreground">{eurcRate.toFixed(4)}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          1 EURC = {eurcRate.toFixed(4)} USDC on Base via Uniswap V3
        </div>
        {timestamp && (
          <div className="text-[10px] text-muted-foreground/50">
            Updated {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

export function UniswapQuotePreview({ tokenIn, amount }: { tokenIn: string; amount: string }) {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!amount || Number(amount) <= 0 || tokenIn === "USDC") {
      setQuote(null);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    fetch(`${API_URL}/uniswap/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tokenIn, tokenOut: "USDC", amount, type: "EXACT_INPUT" }),
    })
      .then(r => r.json())
      .then(d => setQuote(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tokenIn, amount]);

  if (tokenIn === "USDC" || !amount || Number(amount) <= 0) return null;
  if (loading) return <div className="text-xs text-muted-foreground">Fetching Uniswap quote...</div>;
  if (!quote?.output) return null;

  const inAmt = Number(quote.input.amount) / 1e6;
  const outAmt = Number(quote.output.amount) / 1e6;

  return (
    <div className="rounded-lg bg-blue-400/5 border border-blue-400/20 px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">🦄</span>
        <span className="text-xs text-blue-400 font-medium">Uniswap Conversion Preview</span>
      </div>
      <div className="text-xs text-foreground">
        {inAmt.toFixed(2)} {tokenIn} → <span className="text-green-400 font-mono">{outAmt.toFixed(2)} USDC</span>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">
        Route: {quote.route || "Classic"} · Slippage: 0.5%
      </div>
    </div>
  );
}
