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
 * Filter params for FeeReceived. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type FeeReceivedTopics = {
}

/**
 * Decoded FeeReceived event data.
 */
export type FeeReceivedDecoded = {
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
 * Filter params for YieldPaid. Only indexed fields can be used for filtering.
 * Indexed string/bytes must be passed as keccak256 hash (Hex).
 */
export type YieldPaidTopics = {
  lp?: `0x${string}`
}

/**
 * Decoded YieldPaid event data.
 */
export type YieldPaidDecoded = {
  lp: `0x${string}`
  amount: bigint
}


export const YieldReserveABI = [{"inputs":[{"internalType":"address","name":"_usdc","type":"address"},{"internalType":"address","name":"_pool","type":"address"},{"internalType":"address","name":"_admin","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AccessControlBadConfirmation","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"neededRole","type":"bytes32"}],"name":"AccessControlUnauthorizedAccount","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FeeReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"lp","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"YieldPaid","type":"event"},{"inputs":[],"name":"ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CRE_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getReserveBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"cre","type":"address"}],"name":"grantCRERole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"report","type":"bytes"}],"name":"onReport","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"poolContract","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"receiveFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"callerConfirmation","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"usdc","outputs":[{"internalType":"contractIERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"}] as const

export class YieldReserve {
  constructor(
    private readonly client: EVMClient,
    public readonly address: Address,
  ) {}

  aDMINROLE(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'ADMIN_ROLE' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: YieldReserveABI,
      functionName: 'ADMIN_ROLE' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  cREROLE(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'CRE_ROLE' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: YieldReserveABI,
      functionName: 'CRE_ROLE' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  dEFAULTADMINROLE(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'DEFAULT_ADMIN_ROLE' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: YieldReserveABI,
      functionName: 'DEFAULT_ADMIN_ROLE' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  getReserveBalance(
    runtime: Runtime<unknown>,
  ): bigint {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'getReserveBalance' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: YieldReserveABI,
      functionName: 'getReserveBalance' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  getRoleAdmin(
    runtime: Runtime<unknown>,
    role: `0x${string}`,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
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
      abi: YieldReserveABI,
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
      abi: YieldReserveABI,
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
      abi: YieldReserveABI,
      functionName: 'hasRole' as const,
      data: bytesToHex(result.data),
    }) as boolean
  }

  poolContract(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'poolContract' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: YieldReserveABI,
      functionName: 'poolContract' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  supportsInterface(
    runtime: Runtime<unknown>,
    interfaceId: `0x${string}`,
  ): boolean {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
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
      abi: YieldReserveABI,
      functionName: 'supportsInterface' as const,
      data: bytesToHex(result.data),
    }) as boolean
  }

  totalDistributed(
    runtime: Runtime<unknown>,
  ): bigint {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'totalDistributed' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: YieldReserveABI,
      functionName: 'totalDistributed' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  totalFees(
    runtime: Runtime<unknown>,
  ): bigint {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'totalFees' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: YieldReserveABI,
      functionName: 'totalFees' as const,
      data: bytesToHex(result.data),
    }) as bigint
  }

  usdc(
    runtime: Runtime<unknown>,
  ): `0x${string}` {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'usdc' as const,
    })

    const result = this.client
      .callContract(runtime, {
        call: encodeCallMsg({ from: zeroAddress, to: this.address, data: callData }),
        blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
      })
      .result()

    return decodeFunctionResult({
      abi: YieldReserveABI,
      functionName: 'usdc' as const,
      data: bytesToHex(result.data),
    }) as `0x${string}`
  }

  writeReportFromGrantCRERole(
    runtime: Runtime<unknown>,
    cre: `0x${string}`,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
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
      abi: YieldReserveABI,
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

  writeReportFromOnReport(
    runtime: Runtime<unknown>,
    report: `0x${string}`,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'onReport' as const,
      args: [report],
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

  writeReportFromReceiveFee(
    runtime: Runtime<unknown>,
    amount: bigint,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
      functionName: 'receiveFee' as const,
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

  writeReportFromRenounceRole(
    runtime: Runtime<unknown>,
    role: `0x${string}`,
    callerConfirmation: `0x${string}`,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
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

  writeReportFromRevokeRole(
    runtime: Runtime<unknown>,
    role: `0x${string}`,
    account: `0x${string}`,
    gasConfig?: { gasLimit?: string },
  ) {
    const callData = encodeFunctionData({
      abi: YieldReserveABI,
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
   * Creates a log trigger for FeeReceived events.
   * The returned trigger's adapt method decodes the raw log into FeeReceivedDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerFeeReceived(
    filters?: FeeReceivedTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: YieldReserveABI,
        eventName: 'FeeReceived' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
      }
      const encoded = encodeEventTopics({
        abi: YieldReserveABI,
        eventName: 'FeeReceived' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
        }
        return encodeEventTopics({
          abi: YieldReserveABI,
          eventName: 'FeeReceived' as const,
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
      adapt: (rawOutput: EVMLog): DecodedLog<FeeReceivedDecoded> => contract.decodeFeeReceived(rawOutput),
    }
  }

  /**
   * Decodes a log into FeeReceived data, preserving all log metadata.
   */
  decodeFeeReceived(log: EVMLog): DecodedLog<FeeReceivedDecoded> {
    const decoded = decodeEventLog({
      abi: YieldReserveABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as FeeReceivedDecoded }
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
        abi: YieldReserveABI,
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
        abi: YieldReserveABI,
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
          abi: YieldReserveABI,
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
      abi: YieldReserveABI,
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
        abi: YieldReserveABI,
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
        abi: YieldReserveABI,
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
          abi: YieldReserveABI,
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
      abi: YieldReserveABI,
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
        abi: YieldReserveABI,
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
        abi: YieldReserveABI,
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
          abi: YieldReserveABI,
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
      abi: YieldReserveABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as RoleRevokedDecoded }
  }

  /**
   * Creates a log trigger for YieldPaid events.
   * The returned trigger's adapt method decodes the raw log into YieldPaidDecoded,
   * so the handler receives typed event data directly.
   * When multiple filters are provided, topic values are merged with OR semantics (match any).
   */
  logTriggerYieldPaid(
    filters?: YieldPaidTopics[],
  ) {
    let topics: { values: string[] }[]
    if (!filters || filters.length === 0) {
      const encoded = encodeEventTopics({
        abi: YieldReserveABI,
        eventName: 'YieldPaid' as const,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else if (filters.length === 1) {
      const f = filters[0]
      const args = {
        lp: f.lp,
      }
      const encoded = encodeEventTopics({
        abi: YieldReserveABI,
        eventName: 'YieldPaid' as const,
        args,
      })
      topics = encoded.map((t) => ({ values: encodeTopicValue(t) }))
    } else {
      const allEncoded = filters.map((f) => {
        const args = {
          lp: f.lp,
        }
        return encodeEventTopics({
          abi: YieldReserveABI,
          eventName: 'YieldPaid' as const,
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
      adapt: (rawOutput: EVMLog): DecodedLog<YieldPaidDecoded> => contract.decodeYieldPaid(rawOutput),
    }
  }

  /**
   * Decodes a log into YieldPaid data, preserving all log metadata.
   */
  decodeYieldPaid(log: EVMLog): DecodedLog<YieldPaidDecoded> {
    const decoded = decodeEventLog({
      abi: YieldReserveABI,
      data: bytesToHex(log.data),
      topics: log.topics.map((t) => bytesToHex(t)) as [Hex, ...Hex[]],
    })
    const { data: _, ...rest } = log
    return { ...rest, data: decoded.args as unknown as YieldPaidDecoded }
  }
}

