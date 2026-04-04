import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
  testnet: true,
});

export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
export const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;
export const POOL_ADDRESS = (process.env.NEXT_PUBLIC_POOL_ADDRESS || "0xf9F800B7950F2e64A88c914B3e2764B1e8990955") as `0x${string}`;
export const YIELD_RESERVE_ADDRESS = (process.env.NEXT_PUBLIC_YIELD_RESERVE_ADDRESS || "0xe7E0C0c9Ec9772FF4c36033B0a789437023B34e3") as `0x${string}`;
