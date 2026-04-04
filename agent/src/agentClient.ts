import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  AGENT_PRIVATE_KEY: process.env.AGENT_PRIVATE_KEY || "",
  SELLER_WALLET_ADDRESS: process.env.SELLER_WALLET_ADDRESS || "",
  DATA_SERVICE_URL: process.env.AGENT_DATA_SERVICE_URL || "http://localhost:4001",
  POOL_MONITOR_URL: process.env.POOL_MONITOR_URL || "http://localhost:4002",
  CHAIN: "arcTestnet" as const,
};

/**
 * Create a GatewayClient for an agent (buy side).
 * Each agent can have its own wallet or share one.
 */
export async function createAgentClient(privateKey?: string) {
  const { GatewayClient } = await import("@circle-fin/x402-batching/client");

  const key = privateKey || config.AGENT_PRIVATE_KEY;
  if (!key) {
    throw new Error("Agent private key not set");
  }

  const client = new GatewayClient({
    chain: config.CHAIN,
    privateKey: key as `0x${string}`,
  });

  return client;
}
