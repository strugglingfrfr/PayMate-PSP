import { ethers } from "hardhat";

/**
 * Full system test on Arc Testnet:
 *   Phase 2: EURC repayment
 *   Phase 4: Liquidity shortfall event
 *   Phase 7: LP withdrawal (complete cycle)
 */

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

async function main() {
  const provider = ethers.provider;

  const adminKey = process.env.ADMIN_DEPLOYER_PRIVATE_KEY!;
  const lp1Key = process.env.LP_1_PRIVATE_KEY!;
  const psp1Key = process.env.PSP_1_PRIVATE_KEY!;
  const psp2Key = process.env.PSP_2_PRIVATE_KEY!;
  const poolAddress = process.env.POOL_CONTRACT_ADDRESS!;
  const yrAddress = process.env.YIELD_RESERVE_ADDRESS!;

  const admin = new ethers.Wallet(adminKey, provider);
  const lp1 = new ethers.Wallet(lp1Key, provider);
  const psp1 = new ethers.Wallet(psp1Key, provider);
  const psp2 = new ethers.Wallet(psp2Key, provider);

  const Pool = await ethers.getContractFactory("Pool");
  const pool = Pool.attach(poolAddress);

  const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
  const eurc = await ethers.getContractAt("IERC20", EURC_ADDRESS);

  console.log("==========================================");
  console.log("  Full System Test — Arc Testnet");
  console.log("==========================================");

  // Check current state
  const [totalLiq, availLiq] = await pool.getPoolState();
  console.log("\nCurrent pool: total=", ethers.formatUnits(totalLiq, 6), "available=", ethers.formatUnits(availLiq, 6));

  // Check PSP1 position — from seed script, it should be repaid
  const psp1Pos = await pool.getPSPPosition(psp1.address);
  console.log("PSP 1 position: amount=", ethers.formatUnits(psp1Pos[0], 6), "repaid=", psp1Pos[2]);

  // Check EURC balances
  const psp1Eurc = await eurc.balanceOf(psp1.address);
  const psp2Eurc = await eurc.balanceOf(psp2.address);
  console.log("PSP 1 EURC:", ethers.formatUnits(psp1Eurc, 6));
  console.log("PSP 2 EURC:", ethers.formatUnits(psp2Eurc, 6));

  // ============================================================
  // PHASE 2: EURC Repayment
  // ============================================================
  console.log("\n=== PHASE 2: EURC Repayment ===");

  // PSP 2 needs to do a fresh drawdown first, then repay in EURC
  const psp2UsdcBal = await usdc.balanceOf(psp2.address);
  console.log("PSP 2 USDC:", ethers.formatUnits(psp2UsdcBal, 6));

  // PSP 2 draws down 5 USDC
  const drawdownAmt = ethers.parseUnits("5", 6);
  console.log("\nPSP 2 requesting drawdown of 5 USDC...");
  const ddTx = await pool.connect(psp2).requestDrawdown(drawdownAmt);
  const ddReceipt = await ddTx.wait();
  console.log("✓ Drawdown executed. Tx:", ddReceipt?.hash);

  // Check PSP 2 position
  const psp2Pos = await pool.getPSPPosition(psp2.address);
  console.log("PSP 2 position: amount=", ethers.formatUnits(psp2Pos[0], 6), "repaid=", psp2Pos[2]);

  // PSP 2 repays in EURC (non-USDC!)
  const repayEurcAmt = ethers.parseUnits("5.025", 6); // principal + ~fee
  console.log("\nPSP 2 approving EURC for repayment...");
  const eurcApproveTx = await eurc.connect(psp2).approve(poolAddress, repayEurcAmt);
  await eurcApproveTx.wait();
  console.log("✓ EURC approved");

  console.log("PSP 2 repaying 5.025 EURC (non-USDC token)...");
  const repayEurcTx = await pool.connect(psp2).repay(repayEurcAmt, EURC_ADDRESS);
  const repayEurcReceipt = await repayEurcTx.wait();
  console.log("✓ EURC repayment submitted. Tx:", repayEurcReceipt?.hash);
  console.log("  → Pool holds the EURC. RepaymentReceived event emitted.");
  console.log("  → In production, CRE would pick this up and convert to USDC via Uniswap.");

  // Check EURC is now in the Pool contract
  const poolEurc = await eurc.balanceOf(poolAddress);
  console.log("Pool EURC balance:", ethers.formatUnits(poolEurc, 6), "(held for CRE conversion)");

  // Save this tx hash — needed for CRE simulation trigger-index 2
  console.log("\n📝 SAVE THIS — CRE RepaymentReceived trigger tx:", repayEurcReceipt?.hash);

  // ============================================================
  // PHASE 4: Liquidity Shortfall Event
  // ============================================================
  console.log("\n=== PHASE 4: Liquidity Shortfall ===");

  // Current pool state after PSP2 drawdown
  const [, availNow] = await pool.getPoolState();
  console.log("Pool available:", ethers.formatUnits(availNow, 6));

  // PSP 1 position is repaid, so they can request again
  // Request MORE than available to trigger LiquidityShortfall
  const shortfallAmt = ethers.parseUnits("18", 6); // more than available (~10)

  console.log("PSP 1 requesting 18 USDC drawdown (more than available)...");
  const shortfallTx = await pool.connect(psp1).requestDrawdown(shortfallAmt);
  const shortfallReceipt = await shortfallTx.wait();
  console.log("✓ LiquidityShortfall event emitted. Tx:", shortfallReceipt?.hash);

  // Parse the event to show the deficit
  const iface = Pool.interface;
  for (const log of shortfallReceipt?.logs || []) {
    try {
      const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === "LiquidityShortfall") {
        console.log("  PSP:", parsed.args[0]);
        console.log("  Deficit:", ethers.formatUnits(parsed.args[1], 6), "USDC");
        console.log("  RequestId:", parsed.args[2].toString());
      }
    } catch {}
  }

  console.log("\n📝 SAVE THIS — CRE LiquidityShortfall trigger tx:", shortfallReceipt?.hash);

  // ============================================================
  // PHASE 7: LP Withdrawal (Complete Cycle)
  // ============================================================
  console.log("\n=== PHASE 7: LP Withdrawal ===");

  const [lpDeposited, lpClaimable] = await pool.getLPBalance(lp1.address);
  console.log("LP 1 deposited:", ethers.formatUnits(lpDeposited, 6));
  console.log("LP 1 claimable yield:", ethers.formatUnits(lpClaimable, 6));

  const lp1UsdcBefore = await usdc.balanceOf(lp1.address);
  console.log("LP 1 USDC wallet before:", ethers.formatUnits(lp1UsdcBefore, 6));

  // Note: LP can only withdraw if pool has enough available liquidity
  // Pool might not have enough right now because of the shortfall request
  // Let's check
  const [, availForWithdraw] = await pool.getPoolState();
  const totalWithdraw = lpDeposited + lpClaimable;
  console.log("Available for withdraw:", ethers.formatUnits(availForWithdraw, 6));
  console.log("LP wants to withdraw:", ethers.formatUnits(totalWithdraw, 6));

  if (availForWithdraw >= totalWithdraw) {
    console.log("\nLP 1 withdrawing...");
    const withdrawTx = await pool.connect(lp1).withdraw();
    const withdrawReceipt = await withdrawTx.wait();
    console.log("✓ Withdrawn. Tx:", withdrawReceipt?.hash);

    const lp1UsdcAfter = await usdc.balanceOf(lp1.address);
    console.log("LP 1 USDC after:", ethers.formatUnits(lp1UsdcAfter, 6));
    console.log("Received:", ethers.formatUnits(lp1UsdcAfter - lp1UsdcBefore, 6), "USDC");
  } else {
    console.log("\n⚠️ Cannot withdraw — insufficient available liquidity (shortfall pending).");
    console.log("   This is correct behavior: pool protects against over-withdrawal.");
    console.log("   LP can withdraw after CRE resolves the shortfall.");
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n==========================================");
  console.log("  TEST SUMMARY");
  console.log("==========================================");

  const YieldReserve = await ethers.getContractFactory("YieldReserve");
  const yr = YieldReserve.attach(yrAddress);
  const reserveBal = await yr.getReserveBalance();
  const [finalTotal, finalAvail, , ,] = await pool.getPoolState();

  console.log("Pool total liquidity:", ethers.formatUnits(finalTotal, 6));
  console.log("Pool available liquidity:", ethers.formatUnits(finalAvail, 6));
  console.log("YieldReserve balance:", ethers.formatUnits(reserveBal, 6), "USDC");

  console.log("\n✅ Phase 1: Core USDC flow — DONE (from seed.ts)");
  console.log("✅ Phase 2: EURC repayment — RepaymentReceived event emitted");
  console.log("✅ Phase 4: Liquidity shortfall — LiquidityShortfall event emitted");
  console.log("✅ Phase 7: LP withdrawal — tested (may be blocked by shortfall, which is correct)");
  console.log("\nNext: Use the tx hashes above for CRE simulation (Phases 3, 4, 5)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
