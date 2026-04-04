import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/auth";
import { User, Drawdown, Repayment, Pool } from "../models";
import { logAudit } from "../utils/audit";

const router = Router();

// POST /api/psp/onboard — submit KYB profile
router.post("/onboard", authenticate, authorize("PSP"), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.kybProfile) {
      res.status(400).json({ error: "KYB profile already submitted" });
      return;
    }

    const {
      companyName,
      registrationNumber,
      jurisdiction,
      dateOfIncorporation,
      yearsInOperation,
      licenseType,
      licenseNumber,
      issuingAuthority,
      businessType,
      monthlyTransactionVolume,
      primaryCorridors,
      settlementPartners,
      settlementCycle,
      annualRevenue,
      netIncome,
      totalEquity,
      debtRatio,
      bankRelationships,
      amlPolicyInPlace,
      sanctionsScreeningProvider,
      lastRegulatoryAuditDate,
      enforcementActions,
      documents,
    } = req.body;

    // Basic validation — require key fields
    if (!companyName || !registrationNumber || !jurisdiction || !businessType || !settlementCycle) {
      res.status(400).json({
        error: "Missing required fields: companyName, registrationNumber, jurisdiction, businessType, settlementCycle",
      });
      return;
    }

    user.kybProfile = {
      companyName,
      registrationNumber,
      jurisdiction,
      dateOfIncorporation: dateOfIncorporation || "",
      yearsInOperation: yearsInOperation || 0,
      licenseType: licenseType || "",
      licenseNumber: licenseNumber || "",
      issuingAuthority: issuingAuthority || "",
      businessType,
      monthlyTransactionVolume: monthlyTransactionVolume || 0,
      primaryCorridors: primaryCorridors || [],
      settlementPartners: settlementPartners || [],
      settlementCycle,
      annualRevenue: annualRevenue || 0,
      netIncome: netIncome || 0,
      totalEquity: totalEquity || 0,
      debtRatio: debtRatio || 0,
      bankRelationships: bankRelationships || [],
      amlPolicyInPlace: amlPolicyInPlace ?? false,
      sanctionsScreeningProvider: sanctionsScreeningProvider || "",
      lastRegulatoryAuditDate: lastRegulatoryAuditDate || "",
      enforcementActions: enforcementActions ?? false,
      documents: documents || {},
    };

    await user.save();

    await logAudit(req.user!.email, "KYB_SUBMITTED", {
      companyName,
      registrationNumber,
      jurisdiction,
      businessType,
    });

    res.json({
      message: "KYB profile submitted. Pending admin approval.",
      approvalStatus: user.approvalStatus,
    });
  } catch (err: any) {
    console.error("Onboard error:", err.message);
    res.status(500).json({ error: "Onboarding failed" });
  }
});

// GET /api/psp/profile — get own PSP profile
router.get("/profile", authenticate, authorize("PSP"), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select("-passwordHash");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      email: user.email,
      walletAddress: user.walletAddress,
      approved: user.approved,
      approvalStatus: user.approvalStatus,
      kybProfile: user.kybProfile,
      kyrScore: user.kyrScore,
    });
  } catch (err: any) {
    console.error("Get PSP profile error:", err.message);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// POST /api/psp/request-drawdown — request a drawdown
router.post(
  "/request-drawdown",
  authenticate,
  authorize("PSP"),
  async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;

      if (!amount) {
        res.status(400).json({ error: "amount is required" });
        return;
      }

      const user = await User.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (!user.approved) {
        res.status(403).json({ error: "PSP not approved. Complete onboarding first." });
        return;
      }

      if (!user.walletAddress) {
        res.status(400).json({ error: "Wallet not linked" });
        return;
      }

      // Check pool exists and is initialized
      const pool = await Pool.findOne({ initialized: true });
      if (!pool) {
        res.status(400).json({ error: "Pool not initialized" });
        return;
      }

      // Check amount within drawdown limit
      const amountBig = BigInt(amount);
      const limitBig = BigInt(pool.drawdownLimit);
      if (amountBig > limitBig) {
        res.status(400).json({ error: "Amount exceeds drawdown limit" });
        return;
      }

      // Check no active (non-repaid) drawdown
      const activeDrawdown = await Drawdown.findOne({
        pspAddress: user.walletAddress,
        status: { $in: ["pending_approval", "approved", "executed", "shortfall"] },
      });
      if (activeDrawdown) {
        res.status(400).json({ error: "Active drawdown exists. Repay before requesting another." });
        return;
      }

      // Check available liquidity
      const availableBig = BigInt(pool.availableLiquidity);
      const needsApproval = false; // can be toggled by admin in future

      const drawdown = await Drawdown.create({
        pspAddress: user.walletAddress,
        amount,
        status: needsApproval ? "pending_approval" : "approved",
        adminApprovalRequired: needsApproval,
        riskScore: user.kyrScore?.totalScore,
        riskRating: user.kyrScore?.rating,
      });

      await logAudit(req.user!.email, "DRAWDOWN_REQUESTED", {
        amount,
        pspAddress: user.walletAddress,
        drawdownId: drawdown._id,
        availableLiquidity: pool.availableLiquidity,
        sufficientLiquidity: availableBig >= amountBig,
      });

      res.status(201).json({
        drawdown,
        sufficientLiquidity: availableBig >= amountBig,
        message: needsApproval
          ? "Drawdown pending admin approval"
          : availableBig >= amountBig
            ? "Drawdown approved. Sign the transaction in your wallet."
            : "Drawdown approved but liquidity shortfall expected. CRE will source external liquidity.",
      });
    } catch (err: any) {
      console.error("Drawdown request error:", err.message);
      res.status(500).json({ error: "Drawdown request failed" });
    }
  }
);

// GET /api/psp/position — get active position and history
router.get("/position", authenticate, authorize("PSP"), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user || !user.walletAddress) {
      res.status(400).json({ error: "Wallet not linked" });
      return;
    }

    const drawdowns = await Drawdown.find({ pspAddress: user.walletAddress }).sort({
      createdAt: -1,
    });

    const repayments = await Repayment.find({ pspAddress: user.walletAddress }).sort({
      createdAt: -1,
    });

    const activeDrawdown = drawdowns.find((d) =>
      ["pending_approval", "approved", "executed", "shortfall"].includes(d.status)
    );

    // Calculate accrued fee if active position exists
    let accruedFee: string | null = null;
    if (activeDrawdown && activeDrawdown.executedAt) {
      const pool = await Pool.findOne({ initialized: true });
      if (pool) {
        const daysElapsed = Math.max(
          1,
          Math.floor(
            (Date.now() - activeDrawdown.executedAt.getTime()) / (1000 * 60 * 60 * 24)
          )
        );
        const fee =
          (BigInt(activeDrawdown.amount) * BigInt(pool.pspRatePerDay) * BigInt(daysElapsed)) /
          10_000n;
        accruedFee = fee.toString();
      }
    }

    res.json({
      activeDrawdown: activeDrawdown
        ? { ...activeDrawdown.toObject(), accruedFee }
        : null,
      drawdownHistory: drawdowns,
      repaymentHistory: repayments,
    });
  } catch (err: any) {
    console.error("Position error:", err.message);
    res.status(500).json({ error: "Failed to get position" });
  }
});

// POST /api/psp/repay — record a repayment
router.post("/repay", authenticate, authorize("PSP"), async (req: Request, res: Response) => {
  try {
    const { amount, token, tokenSymbol, txHash } = req.body;

    if (!amount || !token || !tokenSymbol || !txHash) {
      res.status(400).json({ error: "amount, token, tokenSymbol, and txHash are required" });
      return;
    }

    const user = await User.findById(req.user!.userId);
    if (!user || !user.walletAddress) {
      res.status(400).json({ error: "Wallet not linked" });
      return;
    }

    // Check active drawdown exists
    const activeDrawdown = await Drawdown.findOne({
      pspAddress: user.walletAddress,
      status: "executed",
    });
    if (!activeDrawdown) {
      res.status(400).json({ error: "No active executed drawdown to repay" });
      return;
    }

    // Check duplicate tx
    const existing = await Repayment.findOne({ txHash });
    if (existing) {
      res.status(409).json({ error: "Transaction already recorded" });
      return;
    }

    const repayment = await Repayment.create({
      pspAddress: user.walletAddress,
      amount,
      token,
      tokenSymbol,
      txHash,
      status: "pending",
    });

    await logAudit(req.user!.email, "REPAYMENT_RECORDED", {
      amount,
      token: tokenSymbol,
      txHash,
      pspAddress: user.walletAddress,
      drawdownId: activeDrawdown._id,
    });

    res.status(201).json({
      repayment,
      message:
        tokenSymbol === "USDC"
          ? "USDC repayment recorded. Awaiting on-chain confirmation."
          : `${tokenSymbol} repayment recorded. CRE will convert to USDC.`,
    });
  } catch (err: any) {
    console.error("Repay error:", err.message);
    res.status(500).json({ error: "Repayment recording failed" });
  }
});

export default router;
