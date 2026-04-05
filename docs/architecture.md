# PayMate Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js + wagmi)"
        LP_UI[LP Dashboard<br/>Deposit / Withdraw / Yield]
        PSP_UI[PSP Dashboard<br/>Drawdown / Repay / History]
        ADMIN_UI[Admin Panel<br/>KYR Scoring / Pool Config]
        WALLET[RainbowKit<br/>Wallet Connect]
        UNI_RATES[Uniswap Rates<br/>Live EURC/USDC]
    end

    subgraph "Backend API (Next.js API Routes)"
        AUTH[Auth<br/>JWT + bcrypt]
        KYB[KYB Onboarding<br/>25+ fields]
        KYR[KYR Scoring<br/>14 criteria matrix]
        POOL_API[Pool Operations<br/>Drawdown / Repay / Deposit]
        AUDIT[Audit Log<br/>Immutable trail]
        UNI_API[Uniswap API<br/>Rate quotes]
    end

    subgraph "MongoDB Atlas"
        DB[(Users / KYB / KYR<br/>Deposits / Drawdowns<br/>Repayments / Yield<br/>Audit Logs)]
    end

    subgraph "Arc Testnet (Chain 5042002)"
        POOL[Pool.sol<br/>Deposits, Drawdowns<br/>Repayments, Yield]
        YR[YieldReserve.sol<br/>Fee accumulation<br/>Yield distribution]
        PRICE[Chainlink Price Feed<br/>IAggregatorV3<br/>EURC/USD verification]
        USDC_TOKEN[USDC<br/>0x3600...0000]
        EURC_TOKEN[EURC<br/>0x89B5...9D72a]
    end

    subgraph "Chainlink CRE (DON)"
        CRON[Cron Trigger<br/>7-day yield cycle]
        LOG1[Log Trigger<br/>LiquidityShortfall]
        LOG2[Log Trigger<br/>RepaymentReceived]
        CONF_HTTP[Confidential HTTP<br/>Private API calls]
    end

    subgraph "Uniswap Trading API"
        QUOTE[/quote endpoint<br/>Swap routing]
        SWAP[/swap endpoint<br/>Tx building]
    end

    subgraph "AI Agents (Nanopayments)"
        DATA_SVC[Data Service<br/>Credit $0.01<br/>Compliance $0.005<br/>Market $0.002]
        CREDIT_AGENT[Credit Risk Agent<br/>Pays $0.018/assessment]
        POOL_MONITOR[Pool Monitor Agent<br/>Buys + Sells $0.003]
        GATEWAY[Circle GatewayWallet<br/>x402 Protocol<br/>Gas-free on Arc]
    end

    %% Frontend connections
    LP_UI --> WALLET
    PSP_UI --> WALLET
    WALLET -->|wagmi txs| POOL
    LP_UI --> POOL_API
    PSP_UI --> POOL_API
    ADMIN_UI --> KYR
    UNI_RATES --> UNI_API

    %% Backend connections
    AUTH --> DB
    KYB --> DB
    KYR --> DB
    POOL_API --> DB
    AUDIT --> DB
    UNI_API --> QUOTE

    %% Smart contract connections
    POOL --> YR
    POOL --> USDC_TOKEN
    POOL --> EURC_TOKEN
    POOL --> PRICE
    YR --> USDC_TOKEN

    %% CRE connections
    CRON -->|distributeYield| POOL
    CRON -->|onReport| YR
    LOG1 -->|completeDrawdown| POOL
    LOG2 -->|processConvertedRepayment| POOL
    LOG1 --> CONF_HTTP
    LOG2 --> CONF_HTTP
    CONF_HTTP --> QUOTE
    CONF_HTTP --> PRICE

    %% Agent connections
    CREDIT_AGENT -->|pays $0.01| DATA_SVC
    CREDIT_AGENT -->|pays $0.003| POOL_MONITOR
    POOL_MONITOR -->|pays $0.002| DATA_SVC
    CREDIT_AGENT --> GATEWAY
    POOL_MONITOR --> GATEWAY
    GATEWAY -->|x402 on Arc| USDC_TOKEN

    %% Styling
    classDef arc fill:#1a1a2e,stroke:#60A5FA,color:#F8FAFC
    classDef cre fill:#1a1a2e,stroke:#4ade80,color:#F8FAFC
    classDef uni fill:#1a1a2e,stroke:#ff69b4,color:#F8FAFC
    classDef agent fill:#1a1a2e,stroke:#f59e0b,color:#F8FAFC
    classDef fe fill:#1a1a2e,stroke:#94A3B8,color:#F8FAFC

    class POOL,YR,PRICE,USDC_TOKEN,EURC_TOKEN arc
    class CRON,LOG1,LOG2,CONF_HTTP cre
    class QUOTE,SWAP uni
    class DATA_SVC,CREDIT_AGENT,POOL_MONITOR,GATEWAY agent
    class LP_UI,PSP_UI,ADMIN_UI,WALLET,UNI_RATES fe
```

## Fund Flow

```
LP deposits USDC ──→ Pool Contract ──→ Available for drawdowns
                                         │
PSP requests drawdown ←──────────────────┘
  │
  ├─ If pool has enough ──→ Direct transfer to PSP
  │
  └─ If shortfall ──→ CRE calls Uniswap API ──→ Sources USDC ──→ completeDrawdown
                          (Confidential HTTP)

PSP repays (any stablecoin)
  │
  ├─ If USDC ──→ Split: principal → Pool, fee → YieldReserve
  │
  └─ If EURC/USDT ──→ CRE converts via Uniswap ──→ processConvertedRepayment
                          (Confidential HTTP)

Every 7 days:
  CRE reads LP balances ──→ Calculates yield ──→ YieldReserve.onReport()
                                                  ──→ Pool.distributeYield()

Before every drawdown:
  Credit Risk Agent ──→ Pays Pool Monitor ($0.003)
                    ──→ Pays Data Service ($0.01 + $0.005)
                    ──→ Returns risk score to backend
                    (All payments gas-free on Arc via x402)
```
