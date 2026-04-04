import { Pool, YieldDistribution, Deposit } from "../models";
import { logAudit } from "../utils/audit";

const YIELD_CYCLE_DAYS = 7;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // check every hour

let intervalId: NodeJS.Timeout | null = null;

export function startYieldScheduler(): void {
  console.log("Yield scheduler: started (checking every hour)");

  // Run immediately on start, then on interval
  checkYieldCycle();
  intervalId = setInterval(checkYieldCycle, CHECK_INTERVAL_MS);
}

async function checkYieldCycle(): Promise<void> {
  try {
    const pool = await Pool.findOne({ initialized: true });
    if (!pool) return;

    const lastCycle = await YieldDistribution.findOne().sort({ cycle: -1 });

    const now = new Date();
    let isDue = false;

    if (!lastCycle) {
      // No distribution has ever happened — check if pool has been active long enough
      const poolAge = now.getTime() - pool.createdAt.getTime();
      const cycleDurationMs = YIELD_CYCLE_DAYS * 24 * 60 * 60 * 1000;
      isDue = poolAge >= cycleDurationMs;
    } else {
      // Check if enough time has passed since last distribution
      const timeSinceLastCycle = now.getTime() - lastCycle.createdAt.getTime();
      const cycleDurationMs = YIELD_CYCLE_DAYS * 24 * 60 * 60 * 1000;
      isDue = timeSinceLastCycle >= cycleDurationMs;
    }

    if (isDue) {
      console.log("Yield scheduler: Distribution cycle is DUE");

      // Calculate what each LP should receive
      const confirmedDeposits = await Deposit.aggregate([
        { $match: { status: "confirmed" } },
        {
          $group: {
            _id: "$lpAddress",
            totalDeposited: { $sum: { $toLong: "$amount" } },
          },
        },
      ]);

      if (confirmedDeposits.length === 0) {
        console.log("Yield scheduler: No confirmed deposits, skipping");
        return;
      }

      // Calculate yield: principal * (APY / 360) * 7 days
      // APY is in basis points (e.g. 500 = 5%)
      const apyBps = BigInt(pool.investorAPY);
      const payouts = confirmedDeposits.map((d) => {
        const principal = BigInt(d.totalDeposited);
        // yield = principal * apyBps * 7 / (360 * 10000)
        const yieldAmount = (principal * apyBps * 7n) / (360n * 10000n);
        return {
          address: d._id as string,
          amount: yieldAmount.toString(),
          principal: principal.toString(),
        };
      });

      const totalYield = payouts.reduce((sum, p) => sum + BigInt(p.amount), 0n);

      console.log(
        `Yield scheduler: ${payouts.length} LPs, total yield: ${totalYield.toString()}`
      );

      // Log that distribution is ready — CRE will actually execute it on-chain
      // The backend just flags it and provides the calculated amounts
      await logAudit("system:yield-scheduler", "YIELD_CYCLE_DUE", {
        cycle: (lastCycle?.cycle || 0) + 1,
        lpCount: payouts.length,
        totalYield: totalYield.toString(),
        payouts: payouts.map((p) => ({
          address: p.address,
          amount: p.amount,
        })),
      });
    }
  } catch (err: any) {
    console.error("Yield scheduler error:", err.message);
  }
}

export function stopYieldScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Yield scheduler stopped");
  }
}
