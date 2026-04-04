import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Execute a real swap on Unichain Sepolia via Uniswap Trading API.
 * This produces a verifiable on-chain tx ID for the Uniswap prize submission.
 *
 * Prerequisites:
 *   - Admin wallet funded with ETH on Unichain Sepolia (from faucet)
 *   - UNISWAP_API_KEY in .env
 */

const UNISWAP_API = "https://trade-api.gateway.uniswap.org/v1";
const API_KEY = process.env.UNISWAP_API_KEY!;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY!;

// Unichain Sepolia
const RPC = "https://sepolia.unichain.org";
const CHAIN_ID = 1301;

// Token addresses on Unichain Sepolia
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x31d0220469e10c4E71834a79b1f276d740d3768F";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Wallet:", wallet.address);
  const ethBal = await provider.getBalance(wallet.address);
  console.log("ETH balance:", ethers.formatEther(ethBal));

  if (ethBal === 0n) {
    console.log("❌ No ETH on Unichain Sepolia. Fund from faucet first.");
    process.exit(1);
  }

  // Use a tiny amount of ETH for the swap
  const swapAmount = ethers.parseEther("0.001"); // 0.001 ETH
  console.log("\nSwapping", ethers.formatEther(swapAmount), "ETH → USDC on Unichain Sepolia");

  // Step 1: Get quote
  console.log("\n1. Getting Uniswap quote...");
  const quoteResp = await fetch(`${UNISWAP_API}/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify({
      tokenIn: WETH,
      tokenInChainId: CHAIN_ID,
      tokenOut: USDC,
      tokenOutChainId: CHAIN_ID,
      amount: swapAmount.toString(),
      type: "EXACT_INPUT",
      swapper: wallet.address,
      slippageTolerance: 0.5,
      routingPreference: "BEST_PRICE",
    }),
  });

  const quoteData = await quoteResp.json() as any;
  if (!quoteData.quote) {
    console.log("❌ No quote available:", JSON.stringify(quoteData).slice(0, 200));
    process.exit(1);
  }

  const outputAmount = quoteData.quote.output?.amount || "0";
  console.log("   Quote:", ethers.formatEther(swapAmount), "ETH →", Number(outputAmount) / 1e6, "USDC");
  console.log("   Route:", quoteData.routing);

  // Step 2: Check approval
  console.log("\n2. Checking approval...");
  const approvalResp = await fetch(`${UNISWAP_API}/check_approval`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify({
      token: WETH,
      amount: swapAmount.toString(),
      chainId: CHAIN_ID,
      walletAddress: wallet.address,
    }),
  });
  const approvalData = await approvalResp.json() as any;
  console.log("   Approval:", JSON.stringify(approvalData).slice(0, 200));

  // If approval needed, execute it
  if (approvalData.approval) {
    console.log("   Sending approval tx...");
    const approveTx = await wallet.sendTransaction({
      to: approvalData.approval.to,
      data: approvalData.approval.data,
      value: approvalData.approval.value || "0",
      gasLimit: 100000,
    });
    const approveReceipt = await approveTx.wait();
    console.log("   ✓ Approval tx:", approveReceipt?.hash);
  }

  // Step 3: Get swap calldata
  console.log("\n3. Building swap transaction...");
  const swapResp = await fetch(`${UNISWAP_API}/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify({
      quote: quoteData.quote,
      permitData: quoteData.permitData,
      signature: "0x", // No permit signature needed for ETH
    }),
  });

  const swapData = await swapResp.json() as any;
  if (!swapData.swap) {
    console.log("❌ Swap build failed:", JSON.stringify(swapData).slice(0, 300));
    // Try submitting the quote directly as a swap
    process.exit(1);
  }

  console.log("   Swap to:", swapData.swap.to);
  console.log("   Value:", swapData.swap.value);

  // Step 4: Execute swap
  console.log("\n4. Executing swap on-chain...");
  const tx = await wallet.sendTransaction({
    to: swapData.swap.to,
    data: swapData.swap.data,
    value: swapData.swap.value || swapAmount,
    gasLimit: swapData.swap.gasLimit || 300000,
  });

  console.log("   Tx submitted:", tx.hash);
  const receipt = await tx.wait();

  console.log("\n========================================");
  console.log("  SWAP EXECUTED SUCCESSFULLY");
  console.log("========================================");
  console.log("  Chain: Unichain Sepolia (1301)");
  console.log("  Tx Hash:", receipt?.hash);
  console.log("  Status:", receipt?.status === 1 ? "✅ Success" : "❌ Failed");
  console.log("  Block:", receipt?.blockNumber);
  console.log("  Input:", ethers.formatEther(swapAmount), "ETH");
  console.log("  Output: ~", Number(outputAmount) / 1e6, "USDC");
  console.log("========================================");
  console.log("\n📝 Use this tx hash for Uniswap prize submission:", receipt?.hash);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});
