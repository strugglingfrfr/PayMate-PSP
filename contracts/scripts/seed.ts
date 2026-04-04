import { ethers } from "hardhat";

/**
 * Seed script: test the full flow on Arc Testnet.
 *
 * Requires:
 *   - Contracts deployed (run deploy.ts first)
 *   - POOL_CONTRACT_ADDRESS and YIELD_RESERVE_ADDRESS in .env
 *   - LP_1 and PSP_1 wallets funded with USDC from faucet
 *
 * Flow:
 *   1. LP deposits USDC
 *   2. PSP requests drawdown
 *   3. PSP repays with USDC
 *   4. Verify pool state
 */

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

async function main() {
  // Load wallet keys from env
  const provider = ethers.provider;

  const adminKey = process.env.ADMIN_DEPLOYER_PRIVATE_KEY;
  const lp1Key = process.env.LP_1_PRIVATE_KEY;
  const psp1Key = process.env.PSP_1_PRIVATE_KEY;

  if (!adminKey || !lp1Key || !psp1Key) {
    throw new Error("Missing wallet keys in .env (ADMIN_DEPLOYER_PRIVATE_KEY, LP_1_PRIVATE_KEY, PSP_1_PRIVATE_KEY)");
  }

  const poolAddress = process.env.POOL_CONTRACT_ADDRESS;
  const yrAddress = process.env.YIELD_RESERVE_ADDRESS;

  if (!poolAddress || !yrAddress) {
    throw new Error("Missing POOL_CONTRACT_ADDRESS or YIELD_RESERVE_ADDRESS in .env. Deploy first.");
  }

  const admin = new ethers.Wallet(adminKey, provider);
  const lp1 = new ethers.Wallet(lp1Key, provider);
  const psp1 = new ethers.Wallet(psp1Key, provider);

  console.log("Admin:", admin.address);
  console.log("LP 1: ", lp1.address);
  console.log("PSP 1:", psp1.address);
  console.log("Pool: ", poolAddress);
  console.log("YR:   ", yrAddress);

  // Connect to contracts
  const Pool = await ethers.getContractFactory("Pool");
  const pool = Pool.attach(poolAddress).connect(admin);
  const poolLP = pool.connect(lp1) as typeof pool;
  const poolPSP = pool.connect(psp1) as typeof pool;

  const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
  const usdcLP = usdc.connect(lp1);
  const usdcPSP = usdc.connect(psp1);

  // Check balances
  const lp1Bal = await usdcLP.balanceOf(lp1.address);
  const psp1Bal = await usdcPSP.balanceOf(psp1.address);
  console.log("\n=== Balances ===");
  console.log("LP 1 USDC:", ethers.formatUnits(lp1Bal, 6));
  console.log("PSP 1 USDC:", ethers.formatUnits(psp1Bal, 6));

  // === Step 1: LP Deposit ===
  console.log("\n=== Step 1: LP Deposit ===");
  const depositAmount = ethers.parseUnits("15", 6); // 15 USDC

  console.log("Approving USDC spend...");
  const approveTx = await usdcLP.approve(poolAddress, depositAmount);
  await approveTx.wait();
  console.log("✓ Approved");

  console.log("Depositing 15 USDC...");
  const depositTx = await poolLP.deposit(depositAmount);
  const depositReceipt = await depositTx.wait();
  console.log("✓ Deposited. Tx:", depositReceipt?.hash);

  // Check pool state
  const [totalLiq, availLiq] = await pool.getPoolState();
  console.log("Pool: total=", ethers.formatUnits(totalLiq, 6), "available=", ethers.formatUnits(availLiq, 6));

  // === Step 2: PSP Drawdown ===
  console.log("\n=== Step 2: PSP Drawdown ===");
  const drawdownAmount = ethers.parseUnits("10", 6); // 10 USDC

  console.log("Requesting drawdown of 10 USDC...");
  const ddTx = await poolPSP.requestDrawdown(drawdownAmount);
  const ddReceipt = await ddTx.wait();
  console.log("✓ Drawdown executed. Tx:", ddReceipt?.hash);

  const pspPosition = await pool.getPSPPosition(psp1.address);
  console.log("PSP position: amount=", ethers.formatUnits(pspPosition[0], 6), "repaid=", pspPosition[2]);

  const [, availAfterDD] = await pool.getPoolState();
  console.log("Pool available after drawdown:", ethers.formatUnits(availAfterDD, 6));

  // Check PSP received the USDC
  const psp1BalAfter = await usdcPSP.balanceOf(psp1.address);
  console.log("PSP 1 USDC after drawdown:", ethers.formatUnits(psp1BalAfter, 6));

  // === Step 3: PSP Repayment ===
  console.log("\n=== Step 3: PSP Repayment ===");
  // Repay 10.05 USDC (principal + ~1 day fee at 50bps)
  const repayAmount = ethers.parseUnits("10.05", 6);

  console.log("Approving USDC for repayment...");
  const repayApproveTx = await usdcPSP.approve(poolAddress, repayAmount);
  await repayApproveTx.wait();

  console.log("Repaying 10.05 USDC...");
  const repayTx = await poolPSP.repay(repayAmount, USDC_ADDRESS);
  const repayReceipt = await repayTx.wait();
  console.log("✓ Repaid. Tx:", repayReceipt?.hash);

  const pspPositionAfter = await pool.getPSPPosition(psp1.address);
  console.log("PSP position after repay: repaid=", pspPositionAfter[2]);

  // === Step 4: Verify Final State ===
  console.log("\n=== Final State ===");
  const [finalTotal, finalAvail, limit, rate, apy] = await pool.getPoolState();
  console.log("Pool total liquidity:", ethers.formatUnits(finalTotal, 6));
  console.log("Pool available liquidity:", ethers.formatUnits(finalAvail, 6));
  console.log("Drawdown limit:", ethers.formatUnits(limit, 6));
  console.log("PSP rate:", rate.toString(), "bps/day");
  console.log("LP APY:", apy.toString(), "bps");

  const [lpDeposited, lpClaimable] = await pool.getLPBalance(lp1.address);
  console.log("LP 1 deposited:", ethers.formatUnits(lpDeposited, 6));
  console.log("LP 1 claimable yield:", ethers.formatUnits(lpClaimable, 6));

  // Check YieldReserve balance (fees should be there)
  const YieldReserve = await ethers.getContractFactory("YieldReserve");
  const yr = YieldReserve.attach(yrAddress).connect(admin);
  const reserveBalance = await yr.getReserveBalance();
  console.log("YieldReserve balance:", ethers.formatUnits(reserveBalance, 6), "USDC (fees)");

  console.log("\n========================================");
  console.log("  SEED COMPLETE — Full flow verified!");
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
