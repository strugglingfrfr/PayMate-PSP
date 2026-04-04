# PayMate PSP Pre-Funding Pool — Full Technical Specification

## 1. Problem Statement

Payment Service Providers (PSPs) must pre-fund settlement accounts across multiple markets before they can process merchant payouts. This creates three core inefficiencies:

- Capital is locked idle in bank accounts earning zero yield, often millions per market.
- Cross-border capital movement takes 1-3 days via traditional banking rails. A sudden spike in merchant payouts in one market cannot be served by capital locked in another.
- FX conversions happen through opaque bank spreads (0.5-2%), eroding PSP margins.

PayMate replaces this with a programmable on-chain credit liquidity layer where PSPs access capital instantly, LPs earn fixed yield on deployed capital, and liquidity gaps are filled dynamically from on-chain markets.

## 2. Solution Architecture

The system has four layers:

**Settlement Layer (Arc)** — Smart contracts on Circle's Arc L1 blockchain handle all pool accounting, deposits, drawdowns, repayments, and yield distribution. Arc is chosen because it is purpose-built for stablecoin finance: USDC is the native gas token, EURC is natively supported, and sub-second finality means settlement is instant.

**Orchestration Layer (Chainlink CRE)** — A TypeScript workflow running on Chainlink's Decentralized Oracle Network automates the system lifecycle. CRE monitors on-chain events, triggers yield distributions on schedule, calls external APIs for liquidity sourcing, and writes results back to Arc contracts. Every operation is verified via BFT consensus across the DON — no single point of failure.

**Liquidity Layer (Uniswap Trading API)** — When the pool lacks sufficient USDC for a PSP drawdown, the CRE workflow calls the Uniswap Trading API to source liquidity from Base or Ethereum (where deep stablecoin liquidity exists). The API handles optimal routing, and the resulting USDC is bridged back to Arc via Circle Gateway. The same API handles repayment conversions when a PSP repays in EURC or another stablecoin.

**Agent Layer (Circle Nanopayments, optional)** — An AI agent monitors repayment schedules, sends reminders to PSPs, and fetches external credit risk signals. The agent pays for these data services via gas-free nanopayments on Arc using the x402 protocol. The agent cannot move pool funds or bypass contract rules.

## 3. Actors

**Admin** — Deploys and initializes the pool. Sets parameters: drawdown limit, PSP rate, LP APY. Can optionally approve first drawdowns for new PSPs. The Admin is a multisig or single EOA that owns the pool contracts.

**LP (Liquidity Provider)** — Deposits USDC into the pool and earns a fixed APY (default 5%). The LP does not bear utilization risk — yield is guaranteed from the Yield Reserve. The LP can withdraw principal plus earned yield after the lock period.

**PSP (Payment Service Provider)** — Requests capital drawdowns from the pool up to their approved limit. The PSP uses this capital to fund merchant settlements. The PSP repays the drawn amount plus a fee (default 0.5% daily rate) within the repayment window. Repayment can be in any supported stablecoin (USDC, EURC, USDT).

**Pool Contract** — The core smart contract on Arc. Manages all deposits, drawdowns, and repayments. Tracks available liquidity, LP balances, PSP positions, and pool state. Emits events that CRE listens to.

**Yield Reserve Contract** — A separate contract on Arc that accumulates PSP repayment fees. CRE triggers periodic yield distributions from this reserve to LPs. The reserve is isolated from pool principal to ensure LP yield is always backed.

**CRE Workflow** — The Chainlink CRE TypeScript workflow running on the DON. Orchestrates yield distribution, repayment processing, Uniswap API calls, and event monitoring. CRE can only write to contracts through the KeystoneForwarder, which validates DON signatures. CRE cannot bypass on-chain require statements or access controls.

**Uniswap Trading API** — An off-chain REST API from Uniswap Labs. Provides optimal swap routing across 20+ chains. Called by the CRE workflow (not by the smart contracts directly). Returns unsigned transactions that are then submitted on-chain.

**Circle Gateway** — Bridges USDC between chains (e.g., Base to Arc) when liquidity is sourced cross-chain. Provides unified USDC balance and instant cross-chain transfers.

**Frontend** — Next.js application with wagmi and RainbowKit. Three dashboards: LP view (deposit, track yield, withdraw), PSP view (drawdown, repay, track position), Admin view (pool parameters, risk indicators).

## 4. System Lifecycle

**Phase 1 — Pool Initialization.** Admin deploys Pool Contract and Yield Reserve Contract on Arc. Admin calls initializePool() with parameters: drawdown limit per PSP, PSP daily rate, LP fixed APY, repayment window duration. CRE workflow is deployed and registered with the DON.

**Phase 2 — LP Deposits.** LPs connect via the frontend, approve USDC spend, and call deposit(). The Pool Contract transfers USDC from the LP, updates their balance, and increases total and available liquidity. Multiple LPs can deposit. The pool is now funded.

**Phase 3 — PSP Drawdown.** A PSP requests capital by calling requestDrawdown(amount). The contract checks: is the amount within the PSP's drawdown limit? Is there sufficient available liquidity?

If the pool has enough USDC, the transfer is direct. The contract decreases available liquidity, records the PSP's outstanding position, and transfers USDC to the PSP.

If the pool does NOT have enough USDC, the contract emits a LiquidityShortfall event with the deficit amount. The CRE workflow picks up this event, calls the Uniswap Trading API to source the deficit from Base/Ethereum, bridges the USDC to Arc via Circle Gateway, and then the drawdown completes. In the hackathon demo, this cross-chain flow may be simulated within the CRE workflow simulation.

If the amount exceeds the drawdown limit, the transaction reverts.

**Phase 4 — PSP Repayment.** The PSP repays by calling repay(amount, token). If the token is USDC, it goes directly to the pool. If the token is EURC, USDT, or another supported stablecoin, the CRE workflow detects the RepaymentReceived event, calls the Uniswap Trading API to get a conversion quote, and executes the swap to normalize everything to USDC.

From the repayment amount, a fee is calculated based on the PSP daily rate and the duration of the drawdown. The principal portion returns to the pool (increasing available liquidity). The fee portion is transferred to the Yield Reserve.

**Phase 5 — Yield Distribution.** Every 7 days, the CRE workflow's cron trigger fires. The workflow reads the Yield Reserve balance and total LP deposits from Arc. It calculates each LP's proportional share of the fixed APY. It writes a signed report to the Yield Reserve contract via the KeystoneForwarder, which distributes USDC to each LP's claimable balance.

**Phase 6 — LP Withdrawal.** LPs call withdraw() to claim their principal plus accumulated yield. The contract checks their balance, transfers USDC, and updates accounting.

## 5. Smart Contract Architecture

### 5.1 Pool Contract

Deployed on Arc. Handles all core accounting.

State variables:
- totalLiquidity (uint256) — total USDC deposited by all LPs
- availableLiquidity (uint256) — USDC currently available for drawdowns
- drawdownLimit (uint256) — maximum drawdown per PSP
- pspRatePerDay (uint256) — daily fee rate for PSPs, in basis points
- investorAPY (uint256) — fixed annual yield for LPs, in basis points
- lpBalances (mapping address to uint256) — each LP's deposit
- lpYieldClaimable (mapping address to uint256) — accumulated yield per LP
- pspPositions (mapping address to Position) — each PSP's outstanding drawdown
- lpAddresses (address array) — list of LP addresses for iteration

Position struct: amount (uint256), drawdownTimestamp (uint256), repaid (bool).

Functions:

initializePool(uint256 _drawdownLimit, uint256 _pspRate, uint256 _apy) — onlyAdmin. Sets pool parameters. Can only be called once.

deposit(uint256 amount) — LP deposits USDC. Transfers USDC from sender via transferFrom. Updates lpBalances, totalLiquidity, availableLiquidity. Adds sender to lpAddresses if new. Emits Deposited(address lp, uint256 amount).

requestDrawdown(uint256 amount) — PSP requests capital. Requires amount <= drawdownLimit. Requires no existing active position (or extend to allow multiple). If availableLiquidity >= amount, transfers directly. If availableLiquidity < amount, emits LiquidityShortfall(address psp, uint256 deficit) and holds the request pending. Once CRE fills the shortfall, CRE calls completeDrawdown(). Emits DrawdownExecuted(address psp, uint256 amount).

completeDrawdown(address psp, uint256 amount) — onlyCRE (via KeystoneForwarder). Called after CRE sources external liquidity. Transfers USDC to PSP. Updates accounting.

repay(uint256 amount, address token) — PSP repays. Transfers tokens from sender. If token is USDC, processes immediately: calculates fee, routes principal to pool, fee to Yield Reserve. If token is not USDC, holds in contract and emits RepaymentReceived(address psp, address token, uint256 amount) for CRE to handle conversion. Emits RepaymentProcessed(address psp, uint256 principal, uint256 fee).

processConvertedRepayment(address psp, uint256 usdcAmount) — onlyCRE. Called after CRE converts non-USDC repayment via Uniswap. Splits into principal and fee, updates accounting.

distributeYield(address[] calldata lps, uint256[] calldata amounts) — onlyCRE. Called by CRE workflow on the 7-day cycle. Adds amounts to each LP's lpYieldClaimable.

withdraw() — LP withdraws principal and claimable yield. Transfers total USDC to sender. Updates balances. Emits Withdrawn(address lp, uint256 amount).

### 5.2 Yield Reserve Contract

Deployed on Arc. Holds PSP fees. Implements IReceiver from Chainlink CRE contracts so the KeystoneForwarder can deliver signed reports.

State variables:
- poolContract (address) — address of the Pool Contract
- totalFees (uint256) — total fees accumulated
- totalDistributed (uint256) — total yield distributed to LPs

Functions:

receiveFee(uint256 amount) — called by Pool Contract when processing repayments. Transfers USDC from Pool Contract.

onReport(bytes calldata report) — IReceiver implementation. Called by KeystoneForwarder with a CRE-signed report. Decodes the report into LP addresses and yield amounts. Transfers USDC to each LP's claimable balance in the Pool Contract. Validates that total distribution does not exceed reserve balance.

getReserveBalance() — view function returning current USDC balance.

### 5.3 Access Control

Admin functions use OpenZeppelin's AccessControl with an ADMIN_ROLE.

CRE functions use a CRE_ROLE granted to the KeystoneForwarder address. The KeystoneForwarder is a Chainlink-deployed contract that validates DON signatures before forwarding reports. This means only the registered CRE workflow can trigger these functions, and the DON must reach consensus before any write.

All state-changing functions re-validate their preconditions (not just access control). For example, distributeYield checks that the reserve has sufficient balance even though CRE already verified this off-chain. This defense-in-depth ensures CRE orchestrates but never bypasses contract rules.

### 5.4 Token Handling

All contracts use OpenZeppelin's SafeERC20 with forceApprove for token transfers. This handles USDT's non-standard approve behavior and prevents approval race conditions.

USDC and EURC both use 6 decimals. All internal math uses 6-decimal precision. Interest calculations scale up intermediates to avoid precision loss: (amount * rate * 1e18) / 1e18, then truncate.

## 6. CRE Workflow Specification

### 6.1 Project Structure

```
cre-workflow/
  project.yaml
  secrets.yaml
  .env
  paymate-workflow/
    workflow.yaml
    main.ts
    workflow.ts
    config.staging.json
    package.json
    tsconfig.json
    workflow.test.ts
```

### 6.2 Triggers

**Cron Trigger — Yield Distribution.** Fires every 7 days. The workflow reads totalLPDeposits and reserve balance from Arc, calculates each LP's share of the fixed APY, and writes a signed report to the Yield Reserve contract.

**Log Trigger — Repayment Processing.** Listens for RepaymentReceived events on the Pool Contract. When a PSP repays in a non-USDC token, the workflow calls the Uniswap Trading API to get a conversion quote (EURC to USDC or USDT to USDC), builds the swap transaction, submits it on the chain where Uniswap liquidity exists (Base or Ethereum), and bridges the resulting USDC back to Arc. Then it calls processConvertedRepayment on the Pool Contract.

**Log Trigger — Liquidity Shortfall.** Listens for LiquidityShortfall events. When the pool cannot fulfill a drawdown, the workflow calls the Uniswap Trading API to source the deficit amount of USDC from Base/Ethereum, bridges it to Arc, and calls completeDrawdown.

### 6.3 Uniswap API Integration Within CRE

The workflow uses CRE's HTTPClient capability to call the Uniswap Trading API:

Step 1 — Check approval: POST to /v1/check_approval with the token address, amount, chain ID, and wallet address.

Step 2 — Get quote: POST to /v1/quote with tokenIn, tokenOut, amount, swapper address, slippage tolerance (0.5% for stablecoins), and routing preference (BEST_PRICE).

Step 3 — Build transaction: POST to /v1/swap with the quote response. Returns an unsigned transaction.

Step 4 — Submit transaction: The CRE workflow submits the unsigned transaction on-chain via EVMClient.

The Uniswap API key is stored in CRE's secrets management (secrets.yaml maps to environment variables).

### 6.4 Security Constraints

The CRE workflow cannot move funds without contract validation. Every write goes through the KeystoneForwarder, which validates DON signatures. The target contracts re-validate all preconditions. If the reserve is empty, distributeYield reverts even if CRE triggers it. If a drawdown exceeds the limit, completeDrawdown reverts even if CRE calls it.

The workflow does not hold private keys to the pool contracts. It writes via signed reports, not direct transactions.

## 7. Uniswap Integration Details

### 7.1 API Endpoints Used

Base URL: https://trade-api.gateway.uniswap.org/v1

POST /check_approval — verify token approvals before swaps.
POST /quote — get optimal swap route with price, gas estimate, slippage.
POST /swap — convert a Classic quote to an unsigned transaction.
GET /swaps — check swap transaction status.

### 7.2 Swap Scenarios

**Drawdown liquidity fallback.** Pool needs X USDC but only has Y. CRE calls /quote with type EXACT_OUTPUT, tokenOut = USDC on Base, amountOut = (X - Y), slippageTolerance = 0.5. The API returns the optimal route. CRE submits the swap on Base, then bridges the USDC to Arc via Circle Gateway.

**Repayment conversion.** PSP repays Z EURC. CRE calls /quote with type EXACT_INPUT, tokenIn = EURC, tokenOut = USDC, amount = Z, on whichever chain has the deepest EURC/USDC liquidity (currently Base, where Chainlink has a EURC/USD price feed). CRE submits the swap, then bridges the USDC to Arc.

### 7.3 Slippage Protection

For stablecoin-to-stablecoin swaps, a 0.5% slippage tolerance is appropriate. The Uniswap API enforces this via the amountOutMinimum parameter in the on-chain swap transaction. If the price moves beyond 0.5% between quote and execution, the transaction reverts.

For additional safety, the CRE workflow can read a Chainlink Data Feed (EURC/USD on Base) to verify the quote is within expected bounds before submitting.

### 7.4 Supported Chains for Swaps

The Uniswap Trading API supports Base, Ethereum, Arbitrum, Polygon, and 16+ other chains. Arc is not currently supported. All swaps execute on a supported chain, and the resulting USDC is bridged to Arc. For the hackathon demo, Base Sepolia (chain ID 84532) is the recommended testnet for Uniswap API calls.

## 8. Circle Gateway and Cross-Chain Bridging

When the CRE workflow sources USDC from Base or Ethereum, it must bridge the USDC to Arc for the pool to use.

Circle Gateway provides instant cross-chain USDC transfers (under 500ms) via GatewayMinter attestations. The CRE workflow initiates a transfer from Base to Arc, and Gateway handles the burn-and-mint flow (burn USDC on Base, mint USDC on Arc).

For the hackathon, if Gateway integration adds too much complexity, the bridge step can be simulated within the CRE workflow. The core smart contract logic and Uniswap API integration remain real and demonstrable.

## 9. Nanopayments Agent Layer

### 9.1 Purpose

Autonomous AI agents provide value-added intelligence to the pool by consuming paid data services via Circle Nanopayments — gas-free micropayments on Arc using the x402 protocol. The agents pay for each API call per-use, demonstrating agent-to-agent commerce without human intervention.

Three agents operate within the system:

**Credit Risk Agent** — Before a PSP drawdown is approved, this agent autonomously queries external credit and risk data to produce a risk assessment. It pays per query via nanopayment.

**Pool Monitoring Agent** — Continuously monitors pool health by paying for market and liquidity data feeds. Alerts admin if utilization or reserve levels cross thresholds.

**Repayment Reminder Agent** — When PSP repayment deadlines approach, this agent pays for notification delivery and fetches the PSP's latest settlement status from external data services.

### 9.2 Architecture

The agent layer consists of two components:

**Data Services (Sell Side)** — An Express server with x402-protected endpoints that simulate real-world paid APIs. Each endpoint requires a nanopayment before returning data. Built with `@circle-fin/x402-batching/server` and the `createGatewayMiddleware`.

| Endpoint | Returns | Price | Simulates |
|---|---|---|---|
| /api/agent/credit-score | PSP risk score (0-100), risk level, factors | $0.01 | Credit bureau API (e.g. Dun & Bradstreet) |
| /api/agent/compliance-check | KYB/sanctions screening result (pass/fail/review) | $0.005 | Compliance screening service (e.g. ComplyAdvantage) |
| /api/agent/market-data | Pool utilization stats, USDC liquidity depth, rates | $0.002 | Market data feed (e.g. DeFi Llama) |

**Agent Client (Buy Side)** — A service that uses `@circle-fin/x402-batching/client` GatewayClient to autonomously call the data service endpoints, paying via nanopayments. The agent is triggered by the backend during drawdown approval flows and on scheduled monitoring cycles.

### 9.3 How It Works

**Setup (one-time):**
1. Fund agent wallet with testnet USDC from Circle Faucet (https://faucet.circle.com, select Arc Testnet).
2. Agent calls `client.deposit("10")` to move USDC into the GatewayWallet contract on Arc. This is the only on-chain transaction — all subsequent payments are gas-free.

**Payment flow (per request):**
1. Agent calls `client.pay("https://data-service/api/agent/credit-score")`.
2. Server responds with HTTP 402 Payment Required, declaring price and payment terms.
3. GatewayClient automatically signs an EIP-3009 TransferWithAuthorization message off-chain (zero gas).
4. Client retries request with signed payment in the `PAYMENT-SIGNATURE` header.
5. Server verifies the signature via the Gateway BatchFacilitatorClient, confirms payment, and returns data.
6. Circle Gateway aggregates all pending authorizations and settles net positions in bulk on-chain periodically.

### 9.4 Integration with Backend

The agent is wired into the backend's drawdown approval flow:

1. PSP requests drawdown via backend API.
2. Backend validates basic checks (amount, limit, approval status).
3. Backend triggers Credit Risk Agent → agent pays $0.01 → receives risk score.
4. If risk score is below threshold, drawdown is flagged for admin review.
5. If risk score passes, backend proceeds to trigger on-chain drawdown.

The Pool Monitoring Agent runs on a scheduled interval (e.g. every hour), paying for market data and comparing against pool state. If anomalies are detected, it logs an alert in the admin dashboard.

The Repayment Reminder Agent is triggered when a PSP's drawdown approaches its repayment window. It pays for the PSP's latest settlement status and sends a notification via the backend.

### 9.5 Packages

```
@circle-fin/x402-batching    — GatewayClient (buy side) + createGatewayMiddleware (sell side)
@x402/core                   — x402 protocol types and utilities
@x402/evm                    — EVM-specific payment verification
viem                         — Wallet and chain interactions
```

### 9.6 Security Constraints

The agents do not have access to pool funds. Each agent operates with its own GatewayWallet balance. Agents cannot call any pool contract functions that move capital. They can only read pool state (view functions) and return data to the backend. The backend makes all decisions — agents provide paid intelligence only.

### 9.7 Sell Side Server Example

```typescript
import express from "express";
import { createGatewayMiddleware } from "@circle-fin/x402-batching/server";

const app = express();
const gateway = createGatewayMiddleware({
  sellerAddress: process.env.SELLER_WALLET_ADDRESS,
  networks: ["eip155:5042002"], // Arc Testnet only
});

app.get("/api/agent/credit-score", gateway.require("$0.01"), (req, res) => {
  const { payer } = req.payment!;
  res.json({ payer, score: 82, risk: "low", factors: ["on-time history", "volume"] });
});

app.get("/api/agent/compliance-check", gateway.require("$0.005"), (req, res) => {
  const { payer } = req.payment!;
  res.json({ payer, status: "pass", sanctions: false, pep: false });
});

app.get("/api/agent/market-data", gateway.require("$0.002"), (req, res) => {
  res.json({ utilization: 0.65, availableLiquidity: "35000", usdcDepth: "1200000" });
});
```

### 9.8 Buy Side Agent Example

```typescript
import { GatewayClient } from "@circle-fin/x402-batching/client";

const client = new GatewayClient({
  chain: "arcTestnet",
  privateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
});

// One-time: deposit USDC into GatewayWallet
await client.deposit("10");

// Per-use: pay for credit score
const { data } = await client.pay("https://data-service/api/agent/credit-score");
console.log(data); // { score: 82, risk: "low", ... }
```

## 10. Backend Application Layer

The backend is a Node.js/Express application with MongoDB that acts as the gatekeeper between the frontend and the smart contracts. It handles all off-chain business logic: user onboarding, validation, orchestration of contract calls, and maintaining a synchronized database of on-chain and off-chain state.

### 10.1 Stack

Node.js with Express. MongoDB with Mongoose for data persistence. ethers.js v6 for contract interactions. JSON Web Tokens (JWT) for authentication. bcrypt for password hashing.

### 10.2 Data Models

**User** — email, passwordHash, role (LP | PSP | ADMIN), walletAddress, createdAt, approved (boolean).

**Pool** — poolContractAddress, drawdownLimit, pspRatePerDay, investorAPY, totalLiquidity, availableLiquidity, initialized (boolean), createdAt.

**Deposit** — lpAddress, amount, txHash, timestamp, status (pending | confirmed).

**Drawdown** — pspAddress, amount, txHash, timestamp, status (pending | approved | executed | shortfall), adminApprovalRequired (boolean), adminApprovedBy (address or null).

**Repayment** — pspAddress, amount, token, txHash, timestamp, status (pending | confirmed | converted), convertedUsdcAmount, feePortion, principalPortion.

**YieldDistribution** — cycle (number), totalDistributed, lpPayouts (array of {address, amount}), txHash, timestamp.

**AuditLog** — actor, action, details, timestamp. Immutable append-only collection for compliance.

### 10.3 API Routes

#### Auth & Onboarding

POST /api/auth/register — Register LP, PSP, or Admin. Validates email, hashes password, stores user. PSPs require subsequent approval.

POST /api/auth/login — Authenticate user, return JWT.

POST /api/auth/link-wallet — Associate a wallet address with the authenticated user's account.

POST /api/psp/onboard — PSP submits onboarding details (business info, KYI score). Backend validates eligibility, stores profile, marks as pending approval.

POST /api/admin/approve-psp — Admin approves a PSP for pool access. Updates user record. Emits audit log.

#### LP Operations

POST /api/lp/deposit — Validate deposit amount, trigger on-chain deposit() call, record in DB. Frontend sends the signed transaction; backend records and monitors confirmation.

GET /api/lp/balance — Returns LP's current deposit, claimable yield, and transaction history. Reads from DB (synced with on-chain state).

POST /api/lp/withdraw — Validate withdrawal (balance > 0, no overdraft), trigger on-chain withdraw() call, update DB.

#### PSP Operations

POST /api/psp/request-drawdown — Validate: amount <= drawdownLimit, pool has liquidity, PSP is approved, no active position, optional first-drawdown admin approval. If valid, trigger on-chain requestDrawdown(). If admin approval required, set status to pending and notify admin.

GET /api/psp/position — Returns PSP's active drawdown position, repayment schedule, accrued fees, and history.

POST /api/psp/repay — Validate repayment amount >= principal + accrued fee. Trigger on-chain repay() call. If non-USDC token, backend monitors RepaymentReceived event and tracks CRE conversion status.

#### Admin Operations

POST /api/admin/initialize-pool — Validate parameters, trigger on-chain initializePool(). Store pool config in DB.

GET /api/admin/dashboard — Returns pool state (total/available liquidity, utilization rate), active PSP positions, yield reserve balance, recent audit logs.

POST /api/admin/approve-drawdown — For first-drawdown approval flow. Admin approves pending drawdown, backend triggers on-chain execution.

GET /api/admin/audit-log — Returns paginated audit log entries.

#### Yield & Monitoring

GET /api/yield/status — Returns current yield reserve balance, last distribution cycle, next scheduled distribution.

POST /api/yield/trigger-distribution — Admin or CRE-triggered. Validates reserve balance, calculates LP shares, triggers on-chain distributeYield() via CRE.

### 10.4 On-Chain Sync

The backend runs a background listener (ethers.js WebSocket provider) that monitors Pool and YieldReserve contract events:

- **Deposited** → update LP deposit record, pool liquidity in DB
- **DrawdownExecuted** → update drawdown status to executed
- **LiquidityShortfall** → update drawdown status to shortfall, log event
- **RepaymentReceived** → update repayment status, track CRE conversion
- **RepaymentProcessed** → update repayment with fee/principal split, update pool liquidity
- **YieldDistributed** → record distribution cycle, update LP claimable balances
- **Withdrawn** → update LP balance, pool liquidity

This ensures the DB stays in sync with on-chain state. The frontend reads from the DB for fast responses, not directly from chain for every request.

### 10.5 Validation & Security

All drawdown requests are double-validated: once in the backend (business rules, approval status, KYI) and once in the smart contract (on-chain require statements). The backend is the first line of defense; the contract is the last.

Prevent double withdrawals by checking DB status before triggering on-chain call.

All state-changing API calls are logged to the AuditLog collection.

JWT tokens expire after 24 hours. Wallet linking requires a signature verification (EIP-191) to prove ownership.

### 10.6 Environment Variables

MONGODB_URI, JWT_SECRET, ARC_RPC_URL, ARC_WS_URL, POOL_CONTRACT_ADDRESS, YIELD_RESERVE_ADDRESS, DEPLOYER_PRIVATE_KEY (for admin operations only), UNISWAP_API_KEY.

## 11. Frontend Specification

### 11.1 Stack

Next.js 15 with App Router. wagmi v2 for contract interactions. viem for ABI encoding and chain definitions. RainbowKit v2 for wallet connection (MetaMask, Rainbow, Ledger). TanStack React Query for server state. Tailwind CSS for styling.

### 11.2 Chain Configuration

Arc Testnet is defined as a custom chain with chain ID 5042002, RPC URL https://rpc.testnet.arc.network, block explorer https://testnet.arcscan.app, and native currency USDC with 6 decimals.

### 11.3 LP Dashboard

Deposit panel: input amount, approve USDC, deposit to pool. Shows current deposit balance, fixed APY rate, accumulated claimable yield, and a withdraw button. Displays transaction history from on-chain events.

### 11.4 PSP Dashboard

Drawdown panel: input amount, request drawdown. Shows drawdown limit, active position (amount, timestamp, fee accruing), repayment button with token selector (USDC, EURC, USDT). Displays position history.

### 11.5 Admin Panel

Pool parameters display: total liquidity, available liquidity, utilization rate, drawdown limit, PSP rate, LP APY. Yield Reserve balance. List of active PSP positions. Optional: toggle to require manual drawdown approval for new PSPs.

### 11.6 Decimal Handling

All UI amounts use 6 decimals (USDC standard). Use viem's formatUnits(value, 6) for display and parseUnits(input, 6) for contract calls. Never hardcode 18 decimals.

## 12. Testing Strategy

### 12.1 Smart Contract Tests (Hardhat)

Unit tests with Hardhat and Chai on a local Hardhat node (chain ID 5042002 to mirror Arc). Deploy mock USDC, EURC, USDT tokens with 6 decimals and faucet functions. Test all contract functions: deposit, drawdown, repayment (USDC direct and non-USDC requiring conversion), yield distribution, withdrawal, access control, edge cases (drawdown over limit, repayment on non-existent position, double withdrawal).

Integration tests with Hardhat mainnet fork for Uniswap V3 swap verification — fork Ethereum mainnet, test real swap routing against live Uniswap contracts. This validates the swap logic even though production uses the Trading API.

### 12.2 CRE Workflow Tests

Use @chainlink/cre-sdk/test framework with EvmMock and newTestRuntime. Mock the Uniswap API responses. Test each trigger handler: cron yield distribution, log-based repayment processing, log-based liquidity shortfall handling.

Simulate the full workflow with `cre workflow simulate` CLI command.

### 12.3 Frontend Tests

Component tests with React Testing Library. Hook tests for wagmi contract interactions with mock providers.

## 13. Deployment Plan

### 13.1 Local Development

Run `npx hardhat node` for local EVM. Deploy mock tokens and contracts. Point frontend to localhost:8545. Develop and iterate rapidly.

### 13.2 Arc Testnet Deployment

Fund deployer wallet from Circle faucet (https://faucet.circle.com). Deploy contracts via Hardhat to Arc Testnet RPC. Verify on testnet.arcscan.app. Point frontend to Arc Testnet.

### 13.3 CRE Deployment

Simulate workflow locally with CRE CLI. If simulation succeeds, the Chainlink hackathon team can deploy it to the live CRE network during the hackathon (per prize description).

### 13.4 Demo Preparation

Fund 3-4 demo wallets from faucet 48 hours before demo. Pre-deploy all contracts. Test full flow end-to-end on Arc Testnet. Have Hardhat local as hot backup (switch via env variable).

## 14. Repository Structure

```
PayMate-PSP/
  contracts/
    src/
      Pool.sol
      YieldReserve.sol
      mocks/
        MockERC20.sol
        MockSwapRouter.sol
    test/
      Pool.test.ts
      YieldReserve.test.ts
      integration/
        UniswapFork.test.ts
    scripts/
      deploy.ts
      seed.ts
    hardhat.config.ts
    package.json
  backend/
    src/
      server.ts
      config/
        db.ts
        env.ts
      models/
        User.ts
        Pool.ts
        Deposit.ts
        Drawdown.ts
        Repayment.ts
        YieldDistribution.ts
        AuditLog.ts
      routes/
        auth.ts
        lp.ts
        psp.ts
        admin.ts
        yield.ts
      middleware/
        auth.ts
        validate.ts
      services/
        contractService.ts
        eventListener.ts
        yieldScheduler.ts
      utils/
        wallet.ts
    package.json
    tsconfig.json
  agent/
    src/
      dataService.ts
      creditRiskAgent.ts
      poolMonitorAgent.ts
      repaymentReminderAgent.ts
    package.json
    tsconfig.json
  cre-workflow/
    project.yaml
    secrets.yaml
    paymate-workflow/
      main.ts
      workflow.ts
      workflow.test.ts
      config.staging.json
      workflow.yaml
      package.json
      tsconfig.json
  frontend/
    app/
      page.tsx
      lp/
        page.tsx
      psp/
        page.tsx
      admin/
        page.tsx
    lib/
      chain.ts
      contracts.ts
      hooks/
    components/
    package.json
    next.config.js
    tailwind.config.js
  docs/
    architecture-diagram.md
  .env.example
  .gitignore
  README.md
```

## 15. Hackathon Prize Alignment

**Arc — Best Smart Contracts with Advanced Stablecoin Logic ($3K).** The Pool and Yield Reserve contracts demonstrate conditional drawdown flows, multi-step settlement (receive non-USDC, convert, split principal/fee, route to reserve), and programmatic fixed-yield distribution — all using USDC and EURC on Arc.

**Chainlink — Best Workflow with CRE ($4K).** The CRE workflow integrates Arc (blockchain) with the Uniswap Trading API (external API) and automates yield distribution, repayment processing, and liquidity sourcing. It can be simulated via the CRE CLI and deployed to the live CRE network.

**Uniswap — Best API Integration ($10K pool).** The CRE workflow calls the Uniswap Trading API with a valid API key for swap quoting, route optimization, and transaction building. Real on-chain swap execution produces verifiable transaction IDs.

**Arc — Best Agentic Economy with Nanopayments ($6K).** Autonomous AI agents (Credit Risk, Pool Monitoring, Repayment Reminder) transact with paid data services via Circle Nanopayments on Arc. Each API call is paid per-use with gas-free USDC micropayments using the x402 protocol. Agents operate without human intervention — the backend triggers them during drawdown approval and on scheduled monitoring cycles. The payment flow is real: EIP-3009 signed authorizations, Gateway batch settlement on-chain, verifiable on Arc testnet.

## 16. Security Constraints (Non-Negotiable)

No repayment is counted without on-chain token transfer confirmation. The contract checks its own balance, not just event data.

Swap slippage is limited to 0.5% for stablecoin pairs. Any swap exceeding this tolerance reverts.

Drawdown limits are enforced strictly. No drawdown can exceed the per-PSP limit, regardless of who calls the function.

The Yield Reserve is isolated. Pool principal and yield reserve funds are in separate contracts. A shortfall in the reserve does not affect LP principal.

CRE orchestrates but does not control funds. All CRE writes go through the KeystoneForwarder with DON signature validation. All target functions re-validate preconditions. CRE cannot move funds if contract conditions are not met.

The optional agent cannot execute transactions on behalf of users, access pool funds, or bypass any contract access control. It can only read public state and send notifications.

## 17. Default Parameters for Demo

LP Fixed APY: 5% annually (500 basis points).
PSP Daily Rate: 0.5% (50 basis points per day).
Drawdown Limit per PSP: 50,000 USDC.
Yield Distribution Cycle: 7 days.
Slippage Tolerance: 0.5% (50 basis points).
Repayment Window: 30 days.
