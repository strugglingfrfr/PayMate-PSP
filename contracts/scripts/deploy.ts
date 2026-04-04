import { ethers } from "hardhat";

/**
 * Deploy PayMate contracts to Arc Testnet.
 *
 * On Arc, USDC is both the native gas token AND available as an ERC20 at:
 *   0x3600000000000000000000000000000000000000
 *
 * Deploy order (handles circular dependency):
 *   1. Predict Pool address using deployer nonce
 *   2. Deploy YieldReserve with predicted Pool address
 *   3. Deploy Pool with YieldReserve address (its address matches prediction)
 *   4. Grant CRE_ROLE on both contracts (for future CRE workflow)
 */

const USDC_ARC_TESTNET = "0x3600000000000000000000000000000000000000";
const EURC_ARC_TESTNET = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

// Demo parameters
const DRAWDOWN_LIMIT = ethers.parseUnits("20", 6); // 20 USDC (faucet limit)
const PSP_RATE_PER_DAY = 50; // 50 bps = 0.5%/day
const INVESTOR_APY = 500; // 500 bps = 5% annual

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const nonce = await ethers.provider.getTransactionCount(deployer.address);
  console.log("Current nonce:", nonce);

  // Step 1: Predict Pool address (deployed at nonce + 1, after YieldReserve at nonce + 0)
  const predictedPoolAddress = ethers.getCreateAddress({
    from: deployer.address,
    nonce: nonce + 1,
  });
  console.log("Predicted Pool address:", predictedPoolAddress);

  // Step 2: Deploy YieldReserve with predicted Pool address
  console.log("\nDeploying YieldReserve...");
  const YieldReserve = await ethers.getContractFactory("YieldReserve");
  const yieldReserve = await YieldReserve.deploy(
    USDC_ARC_TESTNET,
    predictedPoolAddress,
    deployer.address
  );
  await yieldReserve.waitForDeployment();
  const yrAddress = await yieldReserve.getAddress();
  console.log("YieldReserve deployed:", yrAddress);

  // Step 3: Deploy Pool with real YieldReserve address
  console.log("\nDeploying Pool...");
  const Pool = await ethers.getContractFactory("Pool");
  const pool = await Pool.deploy(USDC_ARC_TESTNET, yrAddress, deployer.address);
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  console.log("Pool deployed:", poolAddress);

  // Verify prediction matched
  if (poolAddress !== predictedPoolAddress) {
    throw new Error(
      `Pool address mismatch! Predicted: ${predictedPoolAddress}, Got: ${poolAddress}`
    );
  }
  console.log("✓ Pool address matches prediction");

  // Step 4: Initialize pool with demo parameters
  console.log("\nInitializing pool...");
  const initTx = await pool.initializePool(DRAWDOWN_LIMIT, PSP_RATE_PER_DAY, INVESTOR_APY);
  await initTx.wait();
  console.log("✓ Pool initialized");
  console.log("  Drawdown limit:", ethers.formatUnits(DRAWDOWN_LIMIT, 6), "USDC");
  console.log("  PSP rate:", PSP_RATE_PER_DAY, "bps/day");
  console.log("  LP APY:", INVESTOR_APY, "bps");

  // Step 5: Summary
  console.log("\n========================================");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("  Network:        Arc Testnet (5042002)");
  console.log("  USDC:          ", USDC_ARC_TESTNET);
  console.log("  EURC:          ", EURC_ARC_TESTNET);
  console.log("  Pool:          ", poolAddress);
  console.log("  YieldReserve:  ", yrAddress);
  console.log("  Admin:         ", deployer.address);
  console.log("========================================");
  console.log("\nAdd to your .env:");
  console.log(`POOL_CONTRACT_ADDRESS=${poolAddress}`);
  console.log(`YIELD_RESERVE_ADDRESS=${yrAddress}`);
  console.log("\nNext: run 'npm run seed' to test the full flow");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
