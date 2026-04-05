# Pay<span style="color:#60A5FA">Mate</span> — PSP Pre-Funding Credit Pool

Programmable credit liquidity for Payment Service Providers. Investors earn fixed 5% APY. PSPs access instant USDC capital for corridor settlement. Liquidity gaps filled automatically via Uniswap. All on-chain on Arc.

**Built for EthGlobal Cannes 2026**

## What is PayMate?

Payment Service Providers (PSPs) need to pre-fund settlement accounts across markets before processing merchant payouts. Capital sits idle, cross-border movement takes days, and FX spreads eat margins.

PayMate replaces this with an on-chain credit pool:
- **PSPs** draw USDC instantly for settlement prefunding and repay with fees
- **Investors** deposit USDC and earn a guaranteed 5% fixed APY from PSP fees
- **Chainlink CRE** automates yield distribution every 7 days and handles liquidity shortfalls
- **Uniswap** converts non-USDC repayments (EURC, USDT) and sources external liquidity
- **AI Agents** assess credit risk via nanopayments on Arc before every drawdown

## Live Contracts (Arc Testnet)

| Contract | Address |
|---|---|
| Pool | `0xf9F800B7950F2e64A88c914B3e2764B1e8990955` |
| YieldReserve | `0xe7E0C0c9Ec9772FF4c36033B0a789437023B34e3` |
| USDC (Arc) | `0x3600000000000000000000000000000000000000` |
| EURC (Arc) | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |

View on ArcScan: https://testnet.arcscan.app/address/0xf9F800B7950F2e64A88c914B3e2764B1e8990955

> **Note:** Due to testnet faucet limits (20 USDC per request from Circle faucet), the demo operates at a smaller scale (e.g. $20 drawdown limit instead of $200,000). All logic, fee calculations, and yield mechanics work identically at any scale.

## Architecture

> Full architecture diagram with Mermaid: [docs/architecture.md](docs/architecture.md)

```
Frontend (Next.js + wagmi + RainbowKit)
    ↓ REST API
Backend (Express + MongoDB)  ←→  AI Agents (Nanopayments)
    ↓ ethers.js                        ↓ x402 protocol
Smart Contracts (Arc)        ←→  CRE Workflow (Chainlink DON)
  Pool.sol                              ↓ Confidential HTTP
  YieldReserve.sol                  Uniswap Trading API
                                        ↓
                                  Circle Gateway (bridge)
```

**Flow:**
1. Admin initializes pool with parameters (drawdown limit, PSP rate, investor APY)
2. PSP registers, submits KYB (25+ fields), admin scores with 14-criteria KYR matrix
3. Investor deposits USDC into pool
4. PSP requests drawdown → AI agent pays for credit risk assessment via nanopayments → if approved, USDC transferred to PSP
5. If pool lacks liquidity → CRE calls Uniswap API to source USDC cross-chain
6. PSP repays in any stablecoin → if non-USDC, CRE converts via Uniswap
7. Fee goes to YieldReserve, principal back to pool
8. Every 7 days, CRE distributes yield to investors from YieldReserve
9. Investor withdraws principal + earned yield

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally
- MetaMask browser extension

### 1. Clone and install

```bash
git clone https://github.com/strugglingfrfr/PayMate-PSP.git
cd PayMate-PSP

# Install all packages
cd contracts && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd agent && npm install && cd ..
```

### 2. Environment setup

Copy `.env.example` to `.env` at the project root and fill in:

```bash
cp .env.example .env
```

The key variables:
```
DEPLOYER_PRIVATE_KEY=       # Admin wallet private key
ARC_TESTNET_RPC=https://rpc.testnet.arc.network
POOL_CONTRACT_ADDRESS=0xf9F800B7950F2e64A88c914B3e2764B1e8990955
YIELD_RESERVE_ADDRESS=0xe7E0C0c9Ec9772FF4c36033B0a789437023B34e3
MONGODB_URI=mongodb://localhost:27017/paymate
JWT_SECRET=your-secret-here
UNISWAP_API_KEY=your-uniswap-api-key
```

### 3. Start the backend

```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### 5. Add Arc Testnet to MetaMask

| Field | Value |
|---|---|
| Network Name | Arc Testnet |
| RPC URL | https://rpc.testnet.arc.network |
| Chain ID | 5042002 |
| Currency Symbol | USDC |
| Explorer | https://testnet.arcscan.app |

## Demo Walkthrough

### Pre-funded demo wallets

These wallets are already funded with USDC on Arc Testnet for testing:

**Admin**
- Address: `0xe62768fB3B772054ce23e52B1C4E5e5ccB27Ef4D`
- Private Key: `0xbe2fd1e38e5675f24dc24386de8c5ac33022cba5697426aa779f63e7a7aa5c88`

**Investor (LP)**
- Address: `0x69c87eaf9C7B6Eed7e45aB3bb6eBcB5B4fff1ceD`
- Private Key: `0x0a93f4ad2b6c54f8ffc9acbd0b6d0f93772a01f914bff53c8069d0d1bfc0040c`

**PSP (Borrower)**
- Address: `0xA374Ce4a81302a1Db51Dcd24E2F6939140d3Ac83`
- Private Key: `0x80413d8d24abaeefa35913a84ca644daffbd4aa569c530c6bdefa34bf9b79b0a`

> These are testnet wallets with testnet USDC only. Import them into MetaMask to test the full flow.

### Step-by-step demo flow

**1. Register accounts**
- Go to http://localhost:3000/auth/investor → register as investor (lp@investor.com / lp123)
- Go to http://localhost:3000/auth/psp → register as PSP (psp@aexpress.com / psp123)
- Admin login: admin@paymate.com / admin123

**2. Admin: Initialize pool**
- Login as admin → Admin Dashboard → Initialize Pool
- Pool address: `0xf9F800B7950F2e64A88c914B3e2764B1e8990955`
- YieldReserve: `0xe7E0C0c9Ec9772FF4c36033B0a789437023B34e3`
- Drawdown limit: `20000000` (20 USDC — scaled down for testnet)
- PSP rate: `50` (0.5% per day)
- Investor APY: `500` (5% annual)

**3. PSP: Complete KYB onboarding**
- Login as PSP → 7-step KYB form → Submit
- Admin reviews and approves with 14-criteria KYR score

**4. Investor: Deposit USDC**
- Login as investor → Connect wallet (LP wallet in MetaMask) → Deposit tab
- Enter amount (e.g. 5000000 = $5 USDC) → Approve → Deposit
- MetaMask pops up for both transactions

**5. PSP: Request drawdown**
- Login as PSP → Connect wallet (PSP wallet) → Position tab
- Enter amount (e.g. 3000000 = $3 USDC) → Request Drawdown
- MetaMask signs the transaction → PSP receives USDC

**6. PSP: Repay**
- Repay tab → Select USDC or EURC → Enter amount → Approve → Repay
- If EURC selected: CRE workflow converts to USDC via Uniswap

**7. Investor: Check yield and withdraw**
- Yield is distributed every 7 days by Chainlink CRE automatically
- Withdraw tab → Withdraw All → receives principal + yield

## Project Structure

```
PayMate-PSP/
├── contracts/          # Solidity smart contracts (Hardhat)
│   ├── src/
│   │   ├── Pool.sol              # Core pool: deposits, drawdowns, repayments
│   │   ├── YieldReserve.sol      # Fee accumulator, yield distribution
│   │   └── interfaces/
│   │       ├── IPool.sol
│   │       ├── IYieldReserve.sol
│   │       └── IAggregatorV3.sol # Chainlink Price Feed interface
│   ├── scripts/
│   │   ├── deploy.ts             # Deploy to Arc Testnet
│   │   ├── seed.ts               # Test full flow on-chain
│   │   └── uniswap-swap.ts       # Real swap on Unichain Sepolia
│   └── test/                     # 53 passing unit tests
├── backend/            # Express + MongoDB API
│   └── src/
│       ├── routes/               # auth, lp, psp, admin, yield, uniswap
│       ├── models/               # User (KYB+KYR), Pool, Deposit, Drawdown, etc.
│       ├── services/             # contractService, eventListener, yieldScheduler
│       └── middleware/           # JWT auth, role-based access
├── frontend/           # Next.js 16 + Tailwind + shadcn/ui
│   ├── app/                      # 11 pages (landing, auth, PSP, LP, admin)
│   ├── components/               # UI components + wallet button + Uniswap rates
│   └── lib/                      # wagmi hooks, chain config, contracts
├── cre-workflow/       # Chainlink CRE TypeScript workflow
│   └── paymate-workflow/
│       ├── workflow.ts           # 3 handlers: yield, shortfall, repayment
│       ├── main.ts               # Entry point
│       └── contracts/            # Generated EVM bindings
├── agent/              # Nanopayment AI agents
│   └── src/
│       ├── dataService.ts        # Sell side: 3 x402-protected endpoints
│       ├── creditRiskAgent.ts    # Buys credit score + compliance + pool health
│       ├── poolMonitorAgent.ts   # Buys market data, sells pool analysis
│       └── repaymentReminderAgent.ts
└── TECHNICAL_SPEC.md   # Full technical specification
```

## Verified On-Chain Transactions (Arc Testnet)

| Transaction | Tx Hash | Explorer |
|---|---|---|
| LP deposits 15 USDC | `0x8eafb568...` | [View](https://testnet.arcscan.app/tx/0x8eafb568b5805a6b2b19b6aa10264e499ec7eb2c393483913fe58cf78fbf4a17) |
| PSP draws 10 USDC | `0xa80098...` | [View](https://testnet.arcscan.app/tx/0xa80098280c07dad12ef600149a6138b5aaa4466d9258cc7a6d563ee36fab6b07) |
| PSP repays 10.05 USDC | `0xa47e0c...` | [View](https://testnet.arcscan.app/tx/0xa47e0ccc4cb7ab52b60b1df02fd8c7bd349292643b06c39c94328e29411f5b11) |
| PSP repays 5.025 EURC (non-USDC) | `0x3f6830...` | [View](https://testnet.arcscan.app/tx/0x3f68308ef200c808250eaefacdd157fc3991c3d3ba947ba93028771a87324b5e) |
| Liquidity shortfall event | `0x2de15d...` | [View](https://testnet.arcscan.app/tx/0x2de15dd2dcbae7c960b9f4f97c2d61322d7730628527882d2715dc6ebeee21a0) |
| Agent GatewayWallet deposit | `0x74c28f...` | [View](https://testnet.arcscan.app/tx/0x74c28ffc53bf9898d1cef4f7045dd4d1e703a6d7f0ce91917d5659474d2c04fd) |

## Nanopayment Agent Payments (Arc Testnet)

Real gas-free micropayments via Circle x402 protocol:

| Payment | From | To | Amount | Verified |
|---|---|---|---|---|
| Credit score query | Credit Risk Agent | Data Service | $0.010 | Balance: 5.0 → 4.99 |
| Compliance check | Credit Risk Agent | Data Service | $0.005 | Balance: 4.99 → 4.985 |
| Market data | Pool Monitor Agent | Data Service | $0.002 | Balance: 4.985 → 4.983 |
| Pool health (agent-to-agent) | Credit Risk Agent | Pool Monitor Agent | $0.003 | Balance: 4.981 → 4.978 |

Agent wallet: `0xeA9dd66Fc0785e1Db5C853c2fb2015a6b67f2A30`

---

## Sponsor Integration Details

### Arc by Circle

**Smart Contracts ($3K track)**

PayMate's Pool and YieldReserve contracts are deployed on Arc Testnet and demonstrate advanced stablecoin logic:

- **Conditional drawdown flows:** `requestDrawdown()` checks amount against limit, verifies no active position, and either transfers directly or emits `LiquidityShortfall` for CRE to handle. Two distinct code paths based on available liquidity.
- **Multi-step settlement:** PSP repays in EURC → Pool holds the EURC → emits `RepaymentReceived` → CRE converts via Uniswap → calls `processConvertedRepayment()` → splits into principal (back to pool) and fee (to YieldReserve). Four contracts involved in a single repayment.
- **Chainlink Price Feed integration:** Pool.sol imports `IAggregatorV3` and exposes `getLatestPrice()` and `verifyConversionRate()` for on-chain EURC/USD price verification before swaps.
- **Dual token support:** USDC (`0x3600...`) as base asset, EURC (`0x89B5...`) for multi-token repayments.

Key files:
- `contracts/src/Pool.sol` — Core pool with conditional drawdown, multi-step repayment, Chainlink Price Feed
- `contracts/src/YieldReserve.sol` — Fee accumulation and yield distribution
- `contracts/src/interfaces/IAggregatorV3.sol` — Chainlink Price Feed interface

**Nanopayments ($6K track)**

Four autonomous AI agents transact via Circle Nanopayments on Arc using the x402 protocol:

- **Data Service (sell side):** Three x402-protected endpoints — credit score ($0.01), compliance check ($0.005), market data ($0.002). Uses `@circle-fin/x402-batching/server` with `createGatewayMiddleware`.
- **Pool Monitor Agent (buyer AND seller):** Buys raw market data from Data Service ($0.002), processes it into pool health analysis, then sells that analysis to other agents ($0.003). This is genuine agent-to-agent commerce.
- **Credit Risk Agent:** Before every PSP drawdown, pays three data sources — Pool Monitor ($0.003) + Data Service credit score ($0.01) + Data Service compliance ($0.005) = $0.018 per assessment. Returns risk score and recommendation.
- **Repayment Reminder Agent:** Pays for compliance re-checks and pool health when drawdown approaches repayment window.

All payments are gas-free EIP-3009 signed authorizations on Arc, settled in batch by Circle Gateway. Total of $0.022 spent across 5 paid API calls, verifiable on-chain.

Key files:
- `agent/src/dataService.ts` — x402-protected sell-side endpoints
- `agent/src/poolMonitorAgent.ts` — Buys AND sells (agent-to-agent)
- `agent/src/creditRiskAgent.ts` — Pays 3 sources per assessment
- `agent/src/agentClient.ts` — GatewayClient on arcTestnet

### Uniswap Foundation

PayMate uses the Uniswap Trading API as the conversion and liquidity layer across four integration points:

1. **CRE shortfall handler:** When the pool can't cover a drawdown, the CRE workflow calls `/quote` to source USDC from Uniswap liquidity pools on Base. Uses Confidential HTTP to keep the API key private.
2. **CRE repayment conversion:** When a PSP repays in EURC, CRE calls `/quote` to get the EURC→USDC conversion rate, then processes the converted amount on-chain.
3. **Backend rate API:** `/api/uniswap/rates` endpoint calls the Uniswap `/quote` endpoint for live EURC/USDC rates, served to the frontend.
4. **Frontend conversion preview:** PSP repay page shows real-time preview ("5 EURC → 5.76 USDC") powered by Uniswap quotes before the user commits.

A swap execution script (`uniswap-swap.ts`) demonstrates the full `/quote` → `/swap` → on-chain execution flow on Unichain Sepolia.

Key files:
- `cre-workflow/paymate-workflow/workflow.ts` — CRE handlers calling Uniswap API
- `backend/src/routes/uniswap.ts` — Backend rate and quote endpoints
- `frontend/components/uniswap-rates.tsx` — Live rate display and quote preview
- `contracts/scripts/uniswap-swap.ts` — Real swap execution script

### Chainlink

PayMate uses three Chainlink services:

**CRE Workflow ($4K track)**

A TypeScript workflow compiled to WASM with three handlers:
- **Cron trigger (yield distribution):** Every 7 days, reads LP balances from Pool contract on Arc, calculates pro-rata yield shares, ABI-encodes a report, calls `YieldReserve.onReport()` then `Pool.distributeYield()`.
- **EVM log trigger (liquidity shortfall):** Listens for `LiquidityShortfall` events. Calls Uniswap API for a quote, verifies against Chainlink Price Feed, calls `Pool.completeDrawdown()`.
- **EVM log trigger (repayment conversion):** Listens for `RepaymentReceived` events. Converts non-USDC to USDC via Uniswap, calls `Pool.processConvertedRepayment()`.

All three simulations pass via CRE CLI. Generated type-safe contract bindings via `cre generate-bindings evm`.

**Connect the World ($1K track)**

- Pool.sol imports `IAggregatorV3` and implements `setPriceFeed()`, `getLatestPrice()`, and `verifyConversionRate()` — Chainlink Price Feeds used directly inside smart contracts.
- CRE workflow reads the Chainlink EURC/USD price feed on Base to verify Uniswap quotes.
- CRE makes three state changes on-chain: `distributeYield()`, `completeDrawdown()`, `processConvertedRepayment()`.
- Two Chainlink services used meaningfully: CRE + Price Feeds.

**Privacy Standard ($2K track)**

The CRE workflow uses `ConfidentialHTTPClient` for Uniswap API calls in production mode:
- Go template secret injection: `{{.uniswapApiKey}}` resolved inside secure enclave
- `vaultDonSecrets` configured for enclave-only secret access
- API key, swap amounts, and routing data stay private
- `useConfidentialHttp` config flag toggles between confidential (production) and regular (simulation) HTTP paths

Key files:
- `cre-workflow/paymate-workflow/workflow.ts` — All three handlers + Confidential HTTP
- `contracts/src/Pool.sol` — Chainlink Price Feed integration (lines 240-260)
- `contracts/src/interfaces/IAggregatorV3.sol` — Chainlink interface

## Tech Stack

- **Smart Contracts:** Solidity 0.8.24, Hardhat, OpenZeppelin, Chainlink AggregatorV3
- **Backend:** Node.js, Express, MongoDB, Mongoose, ethers.js v6, JWT
- **Frontend:** Next.js 16, React, Tailwind CSS, shadcn/ui, wagmi, viem, RainbowKit
- **CRE Workflow:** TypeScript, @chainlink/cre-sdk, Bun, compiled to WASM
- **Agents:** @circle-fin/x402-batching, @x402/core, @x402/evm, viem
- **APIs:** Uniswap Trading API, Circle Nanopayments (x402), Arc RPC

## License

MIT
