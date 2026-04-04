import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { User, Deposit, Pool } from "../models";
import { logAudit } from "../utils/audit";

const router = Router();

// POST /api/lp/deposit — record a deposit (frontend signs tx, backend records)
router.post("/deposit", authenticate, authorize("LP"), async (req: Request, res: Response) => {
  try {
    const { amount, txHash } = req.body;

    if (!amount || !txHash) {
      res.status(400).json({ error: "amount and txHash are required" });
      return;
    }

    const user = await User.findById(req.user!.userId);
    if (!user || !user.walletAddress) {
      res.status(400).json({ error: "Wallet not linked. Link wallet first." });
      return;
    }

    // Check for duplicate txHash
    const existing = await Deposit.findOne({ txHash });
    if (existing) {
      res.status(409).json({ error: "Transaction already recorded" });
      return;
    }

    const deposit = await Deposit.create({
      lpAddress: user.walletAddress,
      amount,
      txHash,
      status: "pending",
    });

    await logAudit(req.user!.email, "DEPOSIT_RECORDED", {
      amount,
      txHash,
      lpAddress: user.walletAddress,
    });

    res.status(201).json({ deposit });
  } catch (err: any) {
    console.error("Deposit error:", err.message);
    res.status(500).json({ error: "Deposit recording failed" });
  }
});

// GET /api/lp/balance — get LP's deposit, claimable yield, and history
router.get("/balance", authenticate, authorize("LP"), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user || !user.walletAddress) {
      res.status(400).json({ error: "Wallet not linked" });
      return;
    }

    const deposits = await Deposit.find({ lpAddress: user.walletAddress }).sort({
      createdAt: -1,
    });

    const totalDeposited = deposits
      .filter((d) => d.status === "confirmed")
      .reduce((sum, d) => sum + BigInt(d.amount), 0n);

    // Get pool info for APY
    const pool = await Pool.findOne({ initialized: true });

    res.json({
      walletAddress: user.walletAddress,
      totalDeposited: totalDeposited.toString(),
      investorAPY: pool?.investorAPY || 0,
      deposits,
    });
  } catch (err: any) {
    console.error("Balance error:", err.message);
    res.status(500).json({ error: "Failed to get balance" });
  }
});

// POST /api/lp/withdraw — record a withdrawal request
router.post("/withdraw", authenticate, authorize("LP"), async (req: Request, res: Response) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      res.status(400).json({ error: "txHash is required" });
      return;
    }

    const user = await User.findById(req.user!.userId);
    if (!user || !user.walletAddress) {
      res.status(400).json({ error: "Wallet not linked" });
      return;
    }

    await logAudit(req.user!.email, "WITHDRAWAL_RECORDED", {
      txHash,
      lpAddress: user.walletAddress,
    });

    res.json({ message: "Withdrawal recorded", txHash });
  } catch (err: any) {
    console.error("Withdraw error:", err.message);
    res.status(500).json({ error: "Withdrawal recording failed" });
  }
});

// GET /api/lp/history — get deposit/withdrawal history
router.get("/history", authenticate, authorize("LP"), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user || !user.walletAddress) {
      res.status(400).json({ error: "Wallet not linked" });
      return;
    }

    const deposits = await Deposit.find({ lpAddress: user.walletAddress }).sort({
      createdAt: -1,
    });

    res.json({ deposits });
  } catch (err: any) {
    console.error("History error:", err.message);
    res.status(500).json({ error: "Failed to get history" });
  }
});

export default router;
