import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models";
import { authenticate } from "../middleware/auth";
import { verifyWalletSignature, getLinkWalletMessage } from "../utils/wallet";
import { logAudit } from "../utils/audit";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      res.status(400).json({ error: "email, password, and role are required" });
      return;
    }

    if (!["LP", "PSP", "ADMIN"].includes(role)) {
      res.status(400).json({ error: "role must be LP, PSP, or ADMIN" });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role,
      // LPs and ADMINs are auto-approved; PSPs need admin approval
      approved: role !== "PSP",
      approvalStatus: role === "PSP" ? "pending" : "approved",
    });

    await logAudit(email, "USER_REGISTERED", { role });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        approved: user.approved,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (err: any) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        approved: user.approved,
        approvalStatus: user.approvalStatus,
        walletAddress: user.walletAddress,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/link-wallet
router.post("/link-wallet", authenticate, async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      res.status(400).json({ error: "walletAddress and signature are required" });
      return;
    }

    // Verify EIP-191 signature proves wallet ownership
    const message = getLinkWalletMessage(req.user!.email);
    const valid = verifyWalletSignature(message, signature, walletAddress);
    if (!valid) {
      res.status(400).json({ error: "Invalid wallet signature" });
      return;
    }

    // Check wallet not already linked to another account
    const existingWallet = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
      _id: { $ne: req.user!.userId },
    });
    if (existingWallet) {
      res.status(409).json({ error: "Wallet already linked to another account" });
      return;
    }

    await User.findByIdAndUpdate(req.user!.userId, {
      walletAddress: walletAddress.toLowerCase(),
    });

    await logAudit(req.user!.email, "WALLET_LINKED", { walletAddress });

    res.json({ message: "Wallet linked successfully", walletAddress });
  } catch (err: any) {
    console.error("Link wallet error:", err.message);
    res.status(500).json({ error: "Wallet linking failed" });
  }
});

// GET /api/auth/me — get current user profile
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select("-passwordHash");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  } catch (err: any) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

export default router;
