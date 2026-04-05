# PayMate Architecture

## System Overview

```mermaid
flowchart TD
    FE[Frontend - Next.js + wagmi + RainbowKit] --> API[Backend API - Next.js API Routes]
    FE --> |wallet signing| ARC

    API --> DB[(MongoDB Atlas)]
    API --> UNI_API

    subgraph ARC[Arc Testnet - Smart Contracts]
        POOL[Pool.sol - Deposits, Drawdowns, Repayments]
        YR[YieldReserve.sol - Fee Accumulation]
        PF[Chainlink Price Feed - IAggregatorV3]
        USDC[USDC - 0x3600...0000]
        EURC[EURC - 0x89B5...9D72a]
        POOL --> YR
        POOL --> PF
    end

    subgraph CRE[Chainlink CRE - Decentralized Oracle Network]
        CRON[Cron Trigger - 7 Day Yield Cycle]
        SHORT[Log Trigger - Liquidity Shortfall]
        REPAY[Log Trigger - Repayment Conversion]
    end

    CRE --> |distributeYield, completeDrawdown, processConvertedRepayment| ARC
    CRE --> |Confidential HTTP| UNI_API

    subgraph UNI_API[Uniswap Trading API]
        QUOTE[Quote Endpoint - Swap Routing]
    end

    subgraph AGENTS[AI Agents - Circle Nanopayments on Arc]
        DS[Data Service - Credit Score 0.01, Compliance 0.005, Market 0.002]
        CRA[Credit Risk Agent - Pays 0.018 per assessment]
        PMA[Pool Monitor Agent - Buys and Sells 0.003]
        GW[GatewayWallet - x402 Protocol, Gas Free]
    end

    CRA --> |pays| DS
    CRA --> |pays| PMA
    PMA --> |pays| DS
    AGENTS --> |x402 payments| USDC
```

## Smart Contract Layer (Arc)

```mermaid
flowchart LR
    LP[LP - Investor] --> |deposit USDC| POOL[Pool.sol]
    PSP[PSP - Borrower] --> |requestDrawdown| POOL
    PSP --> |repay USDC or EURC| POOL
    POOL --> |fee| YR[YieldReserve.sol]
    YR --> |yield| LP
    POOL --> |verify rate| PF[Chainlink Price Feed]
    CRE[Chainlink CRE] --> |distributeYield| POOL
    CRE --> |completeDrawdown| POOL
    CRE --> |processConvertedRepayment| POOL
    CRE --> |onReport| YR
```

## Nanopayment Agent Flow (Arc)

```mermaid
graph TD
    A[PSP Requests Drawdown] --> B[Backend Validates]
    B --> C[Credit Risk Agent]
    C --> D[Pool Monitor Agent]
    C --> E[Credit Score API]
    C --> F[Compliance Check API]
    D --> G[Market Data API]
    D --> C
    C --> B
    B --> H[Drawdown Decision]
```

**Payment amounts (gas-free x402 on Arc):**
- Credit Risk Agent → Pool Monitor: $0.003
- Credit Risk Agent → Credit Score: $0.01
- Credit Risk Agent → Compliance: $0.005
- Pool Monitor → Market Data: $0.002
- **Total per assessment: $0.018**

## Fund Flow

```mermaid
flowchart LR
    LP_DEP[LP Deposits USDC] --> POOL[Pool Contract]
    POOL -->|direct transfer| PSP_RECV[PSP Receives USDC]
    POOL -->|if shortfall| CRE[CRE Workflow]
    CRE -->|calls| UNI[Uniswap API]
    UNI -->|sources USDC| CRE
    CRE -->|completeDrawdown| POOL
    PSP_REP[PSP Repays] --> POOL
    POOL -->|fee| YR[Yield Reserve]
    POOL_PRINCIPAL[Principal returns to Pool]
    YR -->|every 7 days via CRE| LP_YIELD[LP Receives Yield]
```

## Deployed Contracts

| Contract | Address | Explorer |
|---|---|---|
| Pool | `0xf9F800B7950F2e64A88c914B3e2764B1e8990955` | [ArcScan](https://testnet.arcscan.app/address/0xf9F800B7950F2e64A88c914B3e2764B1e8990955) |
| YieldReserve | `0xe7E0C0c9Ec9772FF4c36033B0a789437023B34e3` | [ArcScan](https://testnet.arcscan.app/address/0xe7E0C0c9Ec9772FF4c36033B0a789437023B34e3) |
| USDC (Arc) | `0x3600000000000000000000000000000000000000` | Native |
| EURC (Arc) | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | [ArcScan](https://testnet.arcscan.app/address/0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a) |
