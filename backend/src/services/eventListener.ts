import { ethers } from "ethers";
import { env } from "../config/env";
import { Pool, Deposit, Drawdown, Repayment, YieldDistribution } from "../models";
import { logAudit } from "../utils/audit";
import PoolABI from "../config/PoolABI.json";
import YieldReserveABI from "../config/YieldReserveABI.json";

let wsProvider: ethers.WebSocketProvider | null = null;

export async function startEventListener(): Promise<void> {
  if (!env.ARC_WS_URL) {
    console.log("Event listener: ARC_WS_URL not set, skipping WebSocket listener");
    return;
  }

  if (!env.POOL_CONTRACT_ADDRESS || !env.YIELD_RESERVE_ADDRESS) {
    console.log("Event listener: Contract addresses not set, skipping");
    return;
  }

  try {
    wsProvider = new ethers.WebSocketProvider(env.ARC_WS_URL);
    const poolContract = new ethers.Contract(env.POOL_CONTRACT_ADDRESS, PoolABI, wsProvider);
    const yrContract = new ethers.Contract(env.YIELD_RESERVE_ADDRESS, YieldReserveABI, wsProvider);

    console.log("Event listener: Connected to Arc WebSocket");

    // --- Pool Events ---

    poolContract.on("Deposited", async (lp: string, amount: bigint, event: any) => {
      try {
        const txHash = event.log.transactionHash;
        console.log(`Event: Deposited — LP: ${lp} Amount: ${amount}`);

        // Update deposit record from pending to confirmed
        await Deposit.findOneAndUpdate(
          { txHash: txHash.toLowerCase() },
          { status: "confirmed", confirmedAt: new Date() }
        );

        // Update pool state in DB
        await syncPoolState();

        await logAudit("system:event-listener", "DEPOSIT_CONFIRMED", {
          lp,
          amount: amount.toString(),
          txHash,
        });
      } catch (err: any) {
        console.error("Event handler error (Deposited):", err.message);
      }
    });

    poolContract.on(
      "DrawdownExecuted",
      async (psp: string, amount: bigint, event: any) => {
        try {
          const txHash = event.log.transactionHash;
          console.log(`Event: DrawdownExecuted — PSP: ${psp} Amount: ${amount}`);

          // Update drawdown record
          await Drawdown.findOneAndUpdate(
            { pspAddress: psp.toLowerCase(), status: { $in: ["approved", "shortfall"] } },
            { status: "executed", txHash, executedAt: new Date() }
          );

          await syncPoolState();

          await logAudit("system:event-listener", "DRAWDOWN_CONFIRMED", {
            psp,
            amount: amount.toString(),
            txHash,
          });
        } catch (err: any) {
          console.error("Event handler error (DrawdownExecuted):", err.message);
        }
      }
    );

    poolContract.on(
      "LiquidityShortfall",
      async (psp: string, deficit: bigint, requestId: bigint, event: any) => {
        try {
          console.log(
            `Event: LiquidityShortfall — PSP: ${psp} Deficit: ${deficit} RequestId: ${requestId}`
          );

          await Drawdown.findOneAndUpdate(
            { pspAddress: psp.toLowerCase(), status: "approved" },
            { status: "shortfall", requestId: Number(requestId) }
          );

          await logAudit("system:event-listener", "LIQUIDITY_SHORTFALL", {
            psp,
            deficit: deficit.toString(),
            requestId: Number(requestId),
          });
        } catch (err: any) {
          console.error("Event handler error (LiquidityShortfall):", err.message);
        }
      }
    );

    poolContract.on(
      "RepaymentProcessed",
      async (psp: string, principal: bigint, fee: bigint, event: any) => {
        try {
          const txHash = event.log.transactionHash;
          console.log(
            `Event: RepaymentProcessed — PSP: ${psp} Principal: ${principal} Fee: ${fee}`
          );

          // Update repayment with fee/principal split
          await Repayment.findOneAndUpdate(
            { pspAddress: psp.toLowerCase(), status: "pending" },
            {
              status: "confirmed",
              principalPortion: principal.toString(),
              feePortion: fee.toString(),
              confirmedAt: new Date(),
            }
          );

          // Mark the drawdown as repaid (no longer active)
          // We don't have a "repaid" status in our enum, so we use a separate query
          // The drawdown stays as "executed" but the repayment record confirms it

          await syncPoolState();

          await logAudit("system:event-listener", "REPAYMENT_CONFIRMED", {
            psp,
            principal: principal.toString(),
            fee: fee.toString(),
            txHash,
          });
        } catch (err: any) {
          console.error("Event handler error (RepaymentProcessed):", err.message);
        }
      }
    );

    poolContract.on(
      "RepaymentReceived",
      async (psp: string, token: string, amount: bigint) => {
        try {
          console.log(
            `Event: RepaymentReceived (non-USDC) — PSP: ${psp} Token: ${token} Amount: ${amount}`
          );

          await logAudit("system:event-listener", "NON_USDC_REPAYMENT_RECEIVED", {
            psp,
            token,
            amount: amount.toString(),
          });
        } catch (err: any) {
          console.error("Event handler error (RepaymentReceived):", err.message);
        }
      }
    );

    poolContract.on(
      "YieldDistributed",
      async (totalAmount: bigint, timestamp: bigint) => {
        try {
          console.log(
            `Event: YieldDistributed — Total: ${totalAmount} Timestamp: ${timestamp}`
          );

          await syncPoolState();

          await logAudit("system:event-listener", "YIELD_DISTRIBUTION_CONFIRMED", {
            totalAmount: totalAmount.toString(),
            timestamp: Number(timestamp),
          });
        } catch (err: any) {
          console.error("Event handler error (YieldDistributed):", err.message);
        }
      }
    );

    poolContract.on("Withdrawn", async (lp: string, amount: bigint, event: any) => {
      try {
        const txHash = event.log.transactionHash;
        console.log(`Event: Withdrawn — LP: ${lp} Amount: ${amount}`);

        await syncPoolState();

        await logAudit("system:event-listener", "WITHDRAWAL_CONFIRMED", {
          lp,
          amount: amount.toString(),
          txHash,
        });
      } catch (err: any) {
        console.error("Event handler error (Withdrawn):", err.message);
      }
    });

    // --- YieldReserve Events ---

    yrContract.on("FeeReceived", async (amount: bigint) => {
      try {
        console.log(`Event: FeeReceived — Amount: ${amount}`);
        await logAudit("system:event-listener", "FEE_RECEIVED", {
          amount: amount.toString(),
        });
      } catch (err: any) {
        console.error("Event handler error (FeeReceived):", err.message);
      }
    });

    yrContract.on("YieldPaid", async (lp: string, amount: bigint) => {
      try {
        console.log(`Event: YieldPaid — LP: ${lp} Amount: ${amount}`);
        await logAudit("system:event-listener", "YIELD_PAID", {
          lp,
          amount: amount.toString(),
        });
      } catch (err: any) {
        console.error("Event handler error (YieldPaid):", err.message);
      }
    });

    // Handle WebSocket disconnection
    wsProvider.on("error", () => {
      console.log("Event listener: WebSocket error, reconnecting in 5s...");
      setTimeout(() => startEventListener(), 5000);
    });
  } catch (err: any) {
    console.error("Event listener failed to start:", err.message);
    console.log("Retrying in 10s...");
    setTimeout(() => startEventListener(), 10000);
  }
}

/**
 * Sync pool state from chain into the DB.
 * Called after any event that changes pool balances.
 */
async function syncPoolState(): Promise<void> {
  try {
    if (!env.POOL_CONTRACT_ADDRESS) return;

    const rpcProvider = new ethers.JsonRpcProvider(env.ARC_RPC_URL);
    const poolContract = new ethers.Contract(
      env.POOL_CONTRACT_ADDRESS,
      PoolABI,
      rpcProvider
    );

    const [total, available, limit, rate, apy] = await poolContract.getPoolState();

    await Pool.findOneAndUpdate(
      { poolContractAddress: env.POOL_CONTRACT_ADDRESS },
      {
        totalLiquidity: total.toString(),
        availableLiquidity: available.toString(),
        drawdownLimit: limit.toString(),
        pspRatePerDay: Number(rate),
        investorAPY: Number(apy),
      }
    );
  } catch (err: any) {
    console.error("syncPoolState error:", err.message);
  }
}

export function stopEventListener(): void {
  if (wsProvider) {
    wsProvider.destroy();
    wsProvider = null;
    console.log("Event listener stopped");
  }
}
