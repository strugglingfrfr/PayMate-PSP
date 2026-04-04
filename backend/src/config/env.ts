import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/paymate",
  JWT_SECRET: process.env.JWT_SECRET || "dev-jwt-secret-change-in-prod",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",

  // Arc
  ARC_RPC_URL: process.env.ARC_TESTNET_RPC || "https://rpc.testnet.arc.network",
  ARC_WS_URL: process.env.ARC_WS_URL || "",
  ARC_CHAIN_ID: 5042002,

  // Contracts
  POOL_CONTRACT_ADDRESS: process.env.POOL_CONTRACT_ADDRESS || "",
  YIELD_RESERVE_ADDRESS: process.env.YIELD_RESERVE_ADDRESS || "",

  // Admin / deployer
  DEPLOYER_PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY || "",

  // Uniswap
  UNISWAP_API_KEY: process.env.UNISWAP_API_KEY || "",

  // Agent
  AGENT_PRIVATE_KEY: process.env.AGENT_PRIVATE_KEY || "",
  SELLER_WALLET_ADDRESS: process.env.SELLER_WALLET_ADDRESS || "",
  AGENT_DATA_SERVICE_URL: process.env.AGENT_DATA_SERVICE_URL || "http://localhost:4001",
};
