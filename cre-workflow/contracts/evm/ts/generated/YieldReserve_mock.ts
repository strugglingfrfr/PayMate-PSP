// Code generated — DO NOT EDIT.
import type { Address } from 'viem'
import { addContractMock, type ContractMock, type EvmMock } from '@chainlink/cre-sdk/test'

import { YieldReserveABI } from './YieldReserve'

export type YieldReserveMock = {
  aDMINROLE?: () => `0x${string}`
  cREROLE?: () => `0x${string}`
  dEFAULTADMINROLE?: () => `0x${string}`
  getReserveBalance?: () => bigint
  getRoleAdmin?: (role: `0x${string}`) => `0x${string}`
  hasRole?: (role: `0x${string}`, account: `0x${string}`) => boolean
  poolContract?: () => `0x${string}`
  supportsInterface?: (interfaceId: `0x${string}`) => boolean
  totalDistributed?: () => bigint
  totalFees?: () => bigint
  usdc?: () => `0x${string}`
} & Pick<ContractMock<typeof YieldReserveABI>, 'writeReport'>

export function newYieldReserveMock(address: Address, evmMock: EvmMock): YieldReserveMock {
  return addContractMock(evmMock, { address, abi: YieldReserveABI }) as YieldReserveMock
}

