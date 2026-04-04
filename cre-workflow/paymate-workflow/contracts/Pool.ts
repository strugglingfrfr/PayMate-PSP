// Code generated — DO NOT EDIT.
import {
  decodeEventLog,
  decodeFunctionResult,
  encodeEventTopics,
  encodeFunctionData,
  zeroAddress,
} from 'viem'
import type { Address, Hex } from 'viem'
import {
  bytesToHex,
  encodeCallMsg,
  EVMClient,
  hexToBase64,
  LAST_FINALIZED_BLOCK_NUMBER,
  prepareReportRequest,
  type EVMLog,
  type Runtime,
} from '@chainlink/cre-sdk'

export interface DecodedLog<T> extends Omit<EVMLog, 'data'> { data: T }

const encodeTopicValue = (t: Hex | Hex[] | null): string[] => {
  if (t == null) return []
  if (Array.isArray(t)) return t.map(hexToBase64)
  return [hexToBase64(t)]
}





/**
 * Filter params for Deposited. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type DepositedTopics = {
  lp?: `0x${string}`
}

/**
 * Decoded Deposited event data.
 */
export type DepositedDecoded = {
  lp: `0x${string}`
  amount: bigint
}


/**
 * Filter params for DrawdownExecuted. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type DrawdownExecutedTopics = {
  psp?: `0x${string}`
}

/**
 * Decoded DrawdownExecuted event data.
 */
export type DrawdownExecutedDecoded = {
  psp: `0x${string}`
  amount: bigint
}


/**
 * Filter params for LiquidityShortfall. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type LiquidityShortfallTopics = {
  psp?: `0x${string}`
}

/**
 * Decoded LiquidityShortfall event data.
 */
export type LiquidityShortfallDecoded = {
  psp: `0x${string}`
  deficit: bigint
  requestId: bigint
}


/**
 * Filter params for PoolInitialized. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type PoolInitializedTopics = {
}

/**
 * Decoded PoolInitialized event data.
 */
export type PoolInitializedDecoded = {
  drawdownLimit: bigint
  pspRate: bigint
  apy: bigint
}


/**
 * Filter params for RepaymentProcessed. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type RepaymentProcessedTopics = {
  psp?: `0x${string}`
}

/**
 * Decoded RepaymentProcessed event data.
 */
export type RepaymentProcessedDecoded = {
  psp: `0x${string}`
  principal: bigint
  fee: bigint
}


/**
 * Filter params for RepaymentReceived. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type RepaymentReceivedTopics = {
  psp?: `0x${string}`
  token?: `0x${string}`
}

/**
 * Decoded RepaymentReceived event data.
 */
export type RepaymentReceivedDecoded = {
  psp: `0x${string}`
  token: `0x${string}`
  amount: bigint
}


/**
 * Filter params for RoleAdminChanged. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type RoleAdminChangedTopics = {
  role?: `0x${string}`
  previousAdminRole?: `0x${string}`
  newAdminRole?: `0x${string}`
}

/**
 * Decoded RoleAdminChanged event data.
 */
export type RoleAdminChangedDecoded = {
  role: `0x${string}`
  previousAdminRole: `0x${string}`
  newAdminRole: `0x${string}`
}


/**
 * Filter params for RoleGranted. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type RoleGrantedTopics = {
  role?: `0x${string}`
  account?: `0x${string}`
  sender?: `0x${string}`
}

/**
 * Decoded RoleGranted event data.
 */
export type RoleGrantedDecoded = {
  role: `0x${string}`
  account: `0x${string}`
  sender: `0x${string}`
}


/**
 * Filter params for RoleRevoked. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type RoleRevokedTopics = {
  role?: `0x${string}`
  account?: `0x${string}`
  sender?: `0x${string}`
}

/**
 * Decoded RoleRevoked event data.
 */
export type RoleRevokedDecoded = {
  role: `0x${string}`
  account: `0x${string}`
  sender: `0x${string}`
}


/**
 * Filter params for Withdrawn. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type WithdrawnTopics = {
  lp?: `0x${string}`
}

/**
 * Decoded Withdrawn event data.
 */
export type WithdrawnDecoded = {
  lp: `0x${string}`
  amount: bigint
}


/**
 * Filter params for YieldDistributed. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type YieldDistributedTopics = {
}

/**
 * Decoded YieldDistributed event data.
 */
export type YieldDistributedDecoded = {
  totalAmount: bigint
  timestamp: bigint
}


export const PoolABI = [{"inputs":[{"internalType":"address","name":"_usdc","type":"address"},{"internalType":"address","name":"_yieldReserve","type":"address"},{"internalType":"address","name":"_admin","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AccessControlBadConfirmation","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"neededRole","type":"bytes32"}],"name":"AccessControlUnauthorizedAccount","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"lp","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"psp","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"DrawdownExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"psp","type":"address"},{"indexed":false,"internalType":"uint256","name":"deficit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"requestId","type":"uint256"}],"name":"LiquidityShortfall","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"drawdownLimit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"pspRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"apy","type":"uint256"}],"name":"PoolInitialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"psp","type":"address"},{"indexed":false,"internalType":"uint256","name":"principal","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"RepaymentProcessed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"psp","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RepaymentReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"lp","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"YieldDistributed","type":"event"},{"inputs":[],"name":"ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CRE_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"availableLiquidity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"psp","type":"address"},{"internalType":"uint256","name":"requestId","type":"uint256"}],"name":"completeDrawdown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"lps","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"distributeYield","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"drawdownLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLPAddresses","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"lp","type":"address"}],"name":"getLPBalance","outputs":[{"internalType":"uint256","name":"deposited","type":"uint256"},{"internalType":"uint256","name":"claimable","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"psp","type":"address"}],"name":"getPSPPosition","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"repaid","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPoolState","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"cre","type":"address"}],"name":"grantCRERole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_drawdownLimit","type":"uint256"},{"internalType":"uint256","name":"_pspRate","type":"uint256"},{"internalType":"uint256","name":"_apy","type":"uint256"}],"name":"initializePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"initialized","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"investorAPY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"lpAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lpBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lpYieldClaimable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextRequestId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"pendingDrawdowns","outputs":[{"internalType":"address","name":"psp","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"psp","type":"address"},{"internalType":"uint256","name":"usdcAmount","type":"uint256"}],"name":"processConvertedRepayment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"pspPositions","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"drawdownTimestamp","type":"uint256"},{"internalType":"bool","name":"repaid","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pspRatePerDay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"callerConfirmation","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"token","type":"address"}],"name":"repay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"requestDrawdown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalLiquidity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"usdc","outputs":[{"internalType":"contractIERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"yieldReserve","outputs":[{"internalType":"contractIYieldReserve","name":"","type":"address"}],"stateMutability":"view","type":"function"}] as const

export class Pool {
  constructor(
    private readonly client: EVMClient,
    public readonly address: Address,
  ) {}

  aDMINROLE(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'ADMIN_ROLE' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'ADMIN_ROLE' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  cREROLE(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'CRE_ROLE' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'CRE_ROLE' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  dEFAULTADMINROLE(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'DEFAULT_ADMIN_ROLE' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'DEFAULT_ADMIN_ROLE' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  availableLiquidity(
    runtime: Runtime<unknown>,
  ): bigint {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'availableLiquidity' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'availableLiquidity' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  drawdownLimit(
    runtime: Runtime<unknown>,
  ): bigint {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'drawdownLimit' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'drawdownLimit' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  getLPAddresses(
    runtime: Runtime<unknown>,
  ): readonly `0x${string}`[] {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'getLPAddresses' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'getLPAddresses' as const,
      data: bytesToHex(result.data),
    }) as readonly `0x${string}`[]
  }

  getLPBalance(
    runtime: Runtime<unknown>,
    lp: `0x${string}`,
  ): readonly [bigint, bigint] {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'getLPBalance' as const,
      args: [lp],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'getLPBalance' as const,
      data: bytesToHex(result.data),
    }) as readonly [bigint, bigint]
  }

  getPSPPosition(
    runtime: Runtime<unknown>,
    psp: `0x${string}`,
  ): readonly [bigint, bigint, boolean] {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'getPSPPosition' as const,
      args: [psp],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'getPSPPosition' as const,
      data: bytesToHex(result.data),
    }) as readonly [bigint, bigint, boolean]
  }

  getPoolState(
    runtime: Runtime<unknown>,
  ): readonly [bigint, bigint, bigint, bigint, bigint] {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'getPoolState' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'getPoolState' as const,
      data: bytesToHex(result.data),
    }) as readonly [bigint, bigint, bigint, bigint, bigint]
  }

  getRoleAdmin(
    runtime: Runtime<unknown>,
    role: `0x${string}`,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'getRoleAdmin' as const,
      args: [role],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'getRoleAdmin' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  hasRole(
    runtime: Runtime<unknown>,
    role: `0x${string}`,
    account: `0x${string}`,
  ): boolean {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'hasRole' as const,
      args: [role, account],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'hasRole' as const,
      data: bytesToHex(result.data),
    }) as boolean
  }

  initialized(
    runtime: Runtime<unknown>,
  ): boolean {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'initialized' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'initialized' as const,
      data: bytesToHex(result.data),
    }) as boolean
  }

  investorAPY(
    runtime: Runtime<unknown>,
  ): bigint {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'investorAPY' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'investorAPY' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  lpAddresses(
    runtime: Runtime<unknown>,
    arg0: bigint,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'lpAddresses' as const,
      args: [arg0],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'lpAddresses' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  lpBalances(
    runtime: Runtime<unknown>,
    arg0: `0x${string}`,
  ): bigint {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'lpBalances' as const,
      args: [arg0],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'lpBalances' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  lpYieldClaimable(
    runtime: Runtime<unknown>,
    arg0: `0x${string}`,
  ): bigint {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'lpYieldClaimable' as const,
      args: [arg0],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'lpYieldClaimable' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  nextRequestId(
    runtime: Runtime<unknown>,
  ): bigint {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'nextRequestId' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'nextRequestId' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  pendingDrawdowns(
    runtime: Runtime<unknown>,
    arg0: bigint,
  ): readonly [`0x${string}`, bigint, boolean] {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'pendingDrawdowns' as const,
      args: [arg0],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'pendingDrawdowns' as const,
      data: bytesToHex(result.data),
    }) as readonly [`0x${string}`, bigint, boolean]
  }

  pspPositions(
    runtime: Runtime<unknown>,
    arg0: `0x${string}`,
  ): readonly [bigint, bigint, boolean] {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'pspPositions' as const,
      args: [arg0],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'pspPositions' as const,
      data: bytesToHex(result.data),
    }) as readonly [bigint, bigint, boolean]
  }

  pspRatePerDay(
    runtime: Runtime<unknown>,
  ): bigint {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'pspRatePerDay' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'pspRatePerDay' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  supportsInterface(
    runtime: Runtime<unknown>,
    interfaceId: `0x${string}`,
  ): boolean {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'supportsInterface' as const,
      args: [interfaceId],
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'supportsInterface' as const,
      data: bytesToHex(result.data),
    }) as boolean
  }

  totalLiquidity(
    runtime: Runtime<unknown>,
  ): bigint {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'totalLiquidity' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'totalLiquidity' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  usdc(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'usdc' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'usdc' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  yieldReserve(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'yieldReserve' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: PoolABI,
      functionName: 'yieldReserve' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  writeReportFromCompleteDrawdown(
    runtime: Runtime<unknown>,
    psp: `0x${string}`,
    requestId: bigint,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'completeDrawdown' as const,
      args: [psp, requestId],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromDeposit(
    runtime: Runtime<unknown>,
    amount: bigint,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'deposit' as const,
      args: [amount],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromDistributeYield(
    runtime: Runtime<unknown>,
    lps: readonly `0x${string}`[],
    amounts: readonly bigint[],
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'distributeYield' as const,
      args: [lps, amounts],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromGrantCRERole(
    runtime: Runtime<unknown>,
    cre: `0x${string}`,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'grantCRERole' as const,
      args: [cre],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromGrantRole(
    runtime: Runtime<unknown>,
    role: `0x${string}`,
    account: `0x${string}`,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'grantRole' as const,
      args: [role, account],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromInitializePool(
    runtime: Runtime<unknown>,
    drawdownLimit: bigint,
    pspRate: bigint,
    apy: bigint,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'initializePool' as const,
      args: [drawdownLimit, pspRate, apy],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromProcessConvertedRepayment(
    runtime: Runtime<unknown>,
    psp: `0x${string}`,
    usdcAmount: bigint,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'processConvertedRepayment' as const,
      args: [psp, usdcAmount],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromRenounceRole(
    runtime: Runtime<unknown>,
    role: `0x${string}`,
    callerConfirmation: `0x${string}`,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'renounceRole' as const,
      args: [role, callerConfirmation],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromRepay(
    runtime: Runtime<unknown>,
    amount: bigint,
    token: `0x${string}`,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'repay' as const,
      args: [amount, token],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromRequestDrawdown(
    runtime: Runtime<unknown>,
    amount: bigint,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'requestDrawdown' as const,
      args: [amount],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReportFromRevokeRole(
    runtime: Runtime<unknown>,
    role: `0x${string}`,
    account: `0x${string}`,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: PoolABI,
      functionName: 'revokeRole' as const,
      args: [role, account],
    })

    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  writeReport(
    runtime: Runtime<unknown>,
    callData: Hex,
    gasConfig?: { gasLimit?: string },
  ) {
    const reportResponse = runtime
      .report(prepareReportRequest(callData))
      .result()

    return this.client
      .writeReport(runtime, {
        receiver: this.address,
        report: reportResponse,
        gasConfig,
      })
      .result()
  }

  /**
   * Creates a log trigger for Deposited events.
   * The returned trigger's adapt method decodes the raw log into DepositedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerDeposited(
    filters?: DepositedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'Deposited' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        lp: f.lp,
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'Deposited' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          lp: f.lp,
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'Deposited' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<DepositedDecoded> => contract.decodeDeposited(rawOutput),
    }
  }

  /**
   * Decodes a log into Deposited data, preserving all log metadata.
   */
  decodeDeposited(log: EVMLog): DecodedLog<DepositedDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as DepositedDecoded }
  }

  /**
   * Creates a log trigger for DrawdownExecuted events.
   * The returned trigger's adapt method decodes the raw log into DrawdownExecutedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerDrawdownExecuted(
    filters?: DrawdownExecutedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'DrawdownExecuted' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        psp: f.psp,
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'DrawdownExecuted' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          psp: f.psp,
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'DrawdownExecuted' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<DrawdownExecutedDecoded> => contract.decodeDrawdownExecuted(rawOutput),
    }
  }

  /**
   * Decodes a log into DrawdownExecuted data, preserving all log metadata.
   */
  decodeDrawdownExecuted(log: EVMLog): DecodedLog<DrawdownExecutedDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as DrawdownExecutedDecoded }
  }

  /**
   * Creates a log trigger for LiquidityShortfall events.
   * The returned trigger's adapt method decodes the raw log into LiquidityShortfallDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerLiquidityShortfall(
    filters?: LiquidityShortfallTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'LiquidityShortfall' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        psp: f.psp,
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'LiquidityShortfall' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          psp: f.psp,
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'LiquidityShortfall' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<LiquidityShortfallDecoded> => contract.decodeLiquidityShortfall(rawOutput),
    }
  }

  /**
   * Decodes a log into LiquidityShortfall data, preserving all log metadata.
   */
  decodeLiquidityShortfall(log: EVMLog): DecodedLog<LiquidityShortfallDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as LiquidityShortfallDecoded }
  }

  /**
   * Creates a log trigger for PoolInitialized events.
   * The returned trigger's adapt method decodes the raw log into PoolInitializedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerPoolInitialized(
    filters?: PoolInitializedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'PoolInitialized' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'PoolInitialized' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'PoolInitialized' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<PoolInitializedDecoded> => contract.decodePoolInitialized(rawOutput),
    }
  }

  /**
   * Decodes a log into PoolInitialized data, preserving all log metadata.
   */
  decodePoolInitialized(log: EVMLog): DecodedLog<PoolInitializedDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as PoolInitializedDecoded }
  }

  /**
   * Creates a log trigger for RepaymentProcessed events.
   * The returned trigger's adapt method decodes the raw log into RepaymentProcessedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerRepaymentProcessed(
    filters?: RepaymentProcessedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RepaymentProcessed' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        psp: f.psp,
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RepaymentProcessed' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          psp: f.psp,
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'RepaymentProcessed' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<RepaymentProcessedDecoded> => contract.decodeRepaymentProcessed(rawOutput),
    }
  }

  /**
   * Decodes a log into RepaymentProcessed data, preserving all log metadata.
   */
  decodeRepaymentProcessed(log: EVMLog): DecodedLog<RepaymentProcessedDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as RepaymentProcessedDecoded }
  }

  /**
   * Creates a log trigger for RepaymentReceived events.
   * The returned trigger's adapt method decodes the raw log into RepaymentReceivedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerRepaymentReceived(
    filters?: RepaymentReceivedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RepaymentReceived' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        psp: f.psp,
        token: f.token,
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RepaymentReceived' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          psp: f.psp,
          token: f.token,
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'RepaymentReceived' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<RepaymentReceivedDecoded> => contract.decodeRepaymentReceived(rawOutput),
    }
  }

  /**
   * Decodes a log into RepaymentReceived data, preserving all log metadata.
   */
  decodeRepaymentReceived(log: EVMLog): DecodedLog<RepaymentReceivedDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as RepaymentReceivedDecoded }
  }

  /**
   * Creates a log trigger for RoleAdminChanged events.
   * The returned trigger's adapt method decodes the raw log into RoleAdminChangedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerRoleAdminChanged(
    filters?: RoleAdminChangedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RoleAdminChanged' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        role: f.role,
        previousAdminRole: f.previousAdminRole,
        newAdminRole: f.newAdminRole,
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RoleAdminChanged' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          role: f.role,
          previousAdminRole: f.previousAdminRole,
          newAdminRole: f.newAdminRole,
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'RoleAdminChanged' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<RoleAdminChangedDecoded> => contract.decodeRoleAdminChanged(rawOutput),
    }
  }

  /**
   * Decodes a log into RoleAdminChanged data, preserving all log metadata.
   */
  decodeRoleAdminChanged(log: EVMLog): DecodedLog<RoleAdminChangedDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as RoleAdminChangedDecoded }
  }

  /**
   * Creates a log trigger for RoleGranted events.
   * The returned trigger's adapt method decodes the raw log into RoleGrantedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerRoleGranted(
    filters?: RoleGrantedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RoleGranted' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        role: f.role,
        account: f.account,
        sender: f.sender,
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RoleGranted' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          role: f.role,
          account: f.account,
          sender: f.sender,
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'RoleGranted' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<RoleGrantedDecoded> => contract.decodeRoleGranted(rawOutput),
    }
  }

  /**
   * Decodes a log into RoleGranted data, preserving all log metadata.
   */
  decodeRoleGranted(log: EVMLog): DecodedLog<RoleGrantedDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as RoleGrantedDecoded }
  }

  /**
   * Creates a log trigger for RoleRevoked events.
   * The returned trigger's adapt method decodes the raw log into RoleRevokedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerRoleRevoked(
    filters?: RoleRevokedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RoleRevoked' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        role: f.role,
        account: f.account,
        sender: f.sender,
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'RoleRevoked' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          role: f.role,
          account: f.account,
          sender: f.sender,
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'RoleRevoked' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<RoleRevokedDecoded> => contract.decodeRoleRevoked(rawOutput),
    }
  }

  /**
   * Decodes a log into RoleRevoked data, preserving all log metadata.
   */
  decodeRoleRevoked(log: EVMLog): DecodedLog<RoleRevokedDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as RoleRevokedDecoded }
  }

  /**
   * Creates a log trigger for Withdrawn events.
   * The returned trigger's adapt method decodes the raw log into WithdrawnDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerWithdrawn(
    filters?: WithdrawnTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'Withdrawn' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        lp: f.lp,
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'Withdrawn' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          lp: f.lp,
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'Withdrawn' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<WithdrawnDecoded> => contract.decodeWithdrawn(rawOutput),
    }
  }

  /**
   * Decodes a log into Withdrawn data, preserving all log metadata.
   */
  decodeWithdrawn(log: EVMLog): DecodedLog<WithdrawnDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as WithdrawnDecoded }
  }

  /**
   * Creates a log trigger for YieldDistributed events.
   * The returned trigger's adapt method decodes the raw log into YieldDistributedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerYieldDistributed(
    filters?: YieldDistributedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'YieldDistributed' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
      }
      const encoded = encodeEventTopics({
        abi: PoolABI,
        eventName: 'YieldDistributed' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
        }
        return encodeEventTopics({
          abi: PoolABI,
          eventName: 'YieldDistributed' as const,
          args,
        })
      })
      topics = allEncoded[0].map((_, i) => ({
        values: [...new Set(allEncoded.flatMap((row) => encodeTopicValue(row[i])))],
      }))
    }
    const baseTrigger = this.client.logTrigger({
      addresses: [hexToBase64(this.address)],
      topics,
    })
    const contract = this
    return {
      capabilityId: () => baseTrigger.capabilityId(),
      method: () => baseTrigger.method(),
      outputSchema: () => baseTrigger.outputSchema(),
      configAsAny: () => baseTrigger.configAsAny(),
      adapt: (rawOutput: EVMLog): DecodedLog<YieldDistributedDecoded> => contract.decodeYieldDistributed(rawOutput),
    }
  }

  /**
   * Decodes a log into YieldDistributed data, preserving all log metadata.
   */
  decodeYieldDistributed(log: EVMLog): DecodedLog<YieldDistributedDecoded> {
    const decoded = decodeEventLog({
      abi: PoolABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as YieldDistributedDecoded }
  }
}

