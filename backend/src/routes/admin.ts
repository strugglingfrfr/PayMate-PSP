import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { User, AuditLog, Pool, Drawdown, Repayment, YieldDistribution, type KYRScore } from "../models";
import { logAudit } from "../utils/audit";

const router = Router();

// GET /api/admin/pending-psps — list PSPs awaiting approval
router.get(
  "/pending-psps",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    try {
      const psps = await User.find({
        role: "PSP",
        approvalStatus: "pending",
      }).select("-passwordHash");

      res.json({ psps });
    } catch (err: any) {
      console.error("List pending PSPs error:", err.message);
      res.status(500).json({ error: "Failed to list pending PSPs" });
    }
  }
);

// GET /api/admin/psps — list all PSPs
router.get(
  "/psps",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    try {
      const psps = await User.find({ role: "PSP" }).select("-passwordHash");
      res.json({ psps });
    } catch (err: any) {
      console.error("List PSPs error:", err.message);
      res.status(500).json({ error: "Failed to list PSPs" });
    }
  }
);

// POST /api/admin/approve-psp — approve a PSP with KYR score
router.post(
  "/approve-psp",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { pspUserId, kyrScore } = req.body;

      if (!pspUserId) {
        res.status(400).json({ error: "pspUserId is required" });
        return;
      }

      const psp = await User.findById(pspUserId);
      if (!psp || psp.role !== "PSP") {
        res.status(404).json({ error: "PSP not found" });
        return;
      }

      if (psp.approvalStatus === "approved") {
        res.status(400).json({ error: "PSP already approved" });
        return;
      }

      if (!psp.kybProfile) {
        res.status(400).json({ error: "PSP has not submitted KYB profile" });
        return;
      }

      // Calculate KYR score if provided, otherwise use defaults
      let score: KYRScore;
      if (kyrScore) {
        const total =
          (kyrScore.incorporationRegulatory || 0) +
          (kyrScore.businessAgeTrackRecord || 0) +
          (kyrScore.transactionVolumeVelocity || 0) +
          (kyrScore.settlementPartnerQuality || 0) +
          (kyrScore.corridorRemittanceRisk || 0) +
          (kyrScore.prefundingCycleLiquidity || 0) +
          (kyrScore.historicalDataAuditTrail || 0) +
          (kyrScore.bankFloatManagement || 0) +
          (kyrScore.financialStrength || 0) +
          (kyrScore.amlComplianceHealth || 0) +
          (kyrScore.technologyIntegration || 0) +
          (kyrScore.guarantorsCollateral || 0) +
          (kyrScore.previousFinancingPayback || 0) +
          (kyrScore.creditBureau || 0);

        let rating: string;
        if (total >= 85) rating = "AAA";
        else if (total >= 70) rating = "AA";
        else if (total >= 55) rating = "A";
        else rating = "B/C";

        score = { ...kyrScore, totalScore: total, rating };
      } else {
        score = {
          incorporationRegulatory: 0,
          businessAgeTrackRecord: 0,
          transactionVolumeVelocity: 0,
          settlementPartnerQuality: 0,
          corridorRemittanceRisk: 0,
          prefundingCycleLiquidity: 0,
          historicalDataAuditTrail: 0,
          bankFloatManagement: 0,
          financialStrength: 0,
          amlComplianceHealth: 0,
          technologyIntegration: 0,
          guarantorsCollateral: 0,
          previousFinancingPayback: 0,
          creditBureau: 0,
          totalScore: 0,
          rating: "B/C",
        };
      }

      psp.kyrScore = score;
      psp.approved = true;
      psp.approvalStatus = "approved";
      psp.approvedBy = req.user!.email;
      psp.approvedAt = new Date();
      await psp.save();

      await logAudit(req.user!.email, "PSP_APPROVED", {
        pspEmail: psp.email,
        pspUserId: psp._id,
        companyName: psp.kybProfile.companyName,
        kyrTotalScore: score.totalScore,
        kyrRating: score.rating,
      });

      res.json({
        message: "PSP approved",
        psp: {
          id: psp._id,
          email: psp.email,
          companyName: psp.kybProfile.companyName,
          kyrScore: score,
        },
      });
    } catch (err: any) {
      console.error("Approve PSP error:", err.message);
      res.status(500).json({ error: "Approval failed" });
    }
  }
);

// POST /api/admin/reject-psp
router.post(
  "/reject-psp",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { pspUserId, reason } = req.body;

      if (!pspUserId) {
        res.status(400).json({ error: "pspUserId is required" });
        return;
      }

      const psp = await User.findById(pspUserId);
      if (!psp || psp.role !== "PSP") {
        res.status(404).json({ error: "PSP not found" });
        return;
      }

      psp.approved = false;
      psp.approvalStatus = "rejected";
      psp.approvedBy = req.user!.email;
      psp.approvedAt = new Date();
      await psp.save();

      await logAudit(req.user!.email, "PSP_REJECTED", {
        pspEmail: psp.email,
        pspUserId: psp._id,
        reason: reason || "Not specified",
      });

      res.json({ message: "PSP rejected", pspEmail: psp.email });
    } catch (err: any) {
      console.error("Reject PSP error:", err.message);
      res.status(500).json({ error: "Rejection failed" });
    }
  }
);

// GET /api/admin/audit-log
router.get(
  "/audit-log",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        AuditLog.countDocuments(),
      ]);

      res.json({ logs, total, page, pages: Math.ceil(total / limit) });
    } catch (err: any) {
      console.error("Audit log error:", err.message);
      res.status(500).json({ error: "Failed to get audit log" });
    }
  }
);

// POST /api/admin/initialize-pool — create pool record in DB
router.post(
  "/initialize-pool",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { poolContractAddress, yieldReserveAddress, drawdownLimit, pspRatePerDay, investorAPY } =
        req.body;

      if (!poolContractAddress || !yieldReserveAddress || !drawdownLimit || !pspRatePerDay || !investorAPY) {
        res.status(400).json({
          error: "poolContractAddress, yieldReserveAddress, drawdownLimit, pspRatePerDay, investorAPY are required",
        });
        return;
      }

      const existing = await Pool.findOne({ poolContractAddress });
      if (existing) {
        res.status(409).json({ error: "Pool already registered" });
        return;
      }

      const pool = await Pool.create({
        poolContractAddress,
        yieldReserveAddress,
        drawdownLimit,
        pspRatePerDay,
        investorAPY,
        totalLiquidity: "0",
        availableLiquidity: "0",
        initialized: true,
      });

      await logAudit(req.user!.email, "POOL_INITIALIZED", {
        poolContractAddress,
        drawdownLimit,
        pspRatePerDay,
        investorAPY,
      });

      res.status(201).json({ pool });
    } catch (err: any) {
      console.error("Initialize pool error:", err.message);
      res.status(500).json({ error: "Pool initialization failed" });
    }
  }
);

// GET /api/admin/dashboard — pool state, active positions, reserve status
router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN"),
  async (_req: Request, res: Response) => {
    try {
      const pool = await Pool.findOne({ initialized: true });

      const [activeDrawdowns, totalPSPs, approvedPSPs, totalLPs, recentRepayments, lastYieldCycle] =
        await Promise.all([
          Drawdown.find({ status: { $in: ["executed", "shortfall"] } }),
          User.countDocuments({ role: "PSP" }),
          User.countDocuments({ role: "PSP", approved: true }),
          User.countDocuments({ role: "LP" }),
          Repayment.find().sort({ createdAt: -1 }).limit(10),
          YieldDistribution.findOne().sort({ cycle: -1 }),
        ]);

      const totalDrawnAmount = activeDrawdowns.reduce(
        (sum, d) => sum + BigInt(d.amount),
        0n
      );

      const utilizationRate = pool && BigInt(pool.totalLiquidity) > 0n
        ? Number((totalDrawnAmount * 10000n) / BigInt(pool.totalLiquidity)) / 100
        : 0;

      res.json({
        pool: pool
          ? {
              address: pool.poolContractAddress,
              totalLiquidity: pool.totalLiquidity,
              availableLiquidity: pool.availableLiquidity,
              drawdownLimit: pool.drawdownLimit,
              pspRatePerDay: pool.pspRatePerDay,
              investorAPY: pool.investorAPY,
              utilizationRate: `${utilizationRate}%`,
            }
          : null,
        activeDrawdowns: activeDrawdowns.length,
        totalDrawnAmount: totalDrawnAmount.toString(),
        stats: {
          totalPSPs,
          approvedPSPs,
          totalLPs,
        },
        recentRepayments,
        lastYieldCycle: lastYieldCycle
          ? { cycle: lastYieldCycle.cycle, totalDistributed: lastYieldCycle.totalDistributed }
          : null,
      });
    } catch (err: any) {
      console.error("Dashboard error:", err.message);
      res.status(500).json({ error: "Failed to load dashboard" });
    }
  }
);

// POST /api/admin/approve-drawdown — approve a pending drawdown
router.post(
  "/approve-drawdown",
  authenticate,
  authorize("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { drawdownId } = req.body;

      if (!drawdownId) {
        res.status(400).json({ error: "drawdownId is required" });
        return;
      }

      const drawdown = await Drawdown.findById(drawdownId);
      if (!drawdown) {
        res.status(404).json({ error: "Drawdown not found" });
        return;
      }

      if (drawdown.status !== "pending_approval") {
        res.status(400).json({ error: `Cannot approve drawdown with status: ${drawdown.status}` });
        return;
      }

      drawdown.status = "approved";
      drawdown.adminApprovedBy = req.user!.email;
      await drawdown.save();

      await logAudit(req.user!.email, "DRAWDOWN_APPROVED", {
        drawdownId: drawdown._id,
        pspAddress: drawdown.pspAddress,
        amount: drawdown.amount,
      });

      res.json({ message: "Drawdown approved", drawdown });
    } catch (err: any) {
      console.error("Approve drawdown error:", err.message);
      res.status(500).json({ error: "Drawdown approval failed" });
    }
  }
);

export default router;
