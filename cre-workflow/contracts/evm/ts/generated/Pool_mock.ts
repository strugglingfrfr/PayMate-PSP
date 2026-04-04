// Code generated — DO NOT EDIT.
import type { Address } from 'viem'
import { addContractMock, type ContractMock, type EvmMock } from '@chainlink/cre-sdk/test'

import { PoolABI } from './Pool'

export type PoolMock = {
  aDMINROLE?: () => `0x${string}`
  cREROLE?: () => `0x${string}`
  dEFAULTADMINROLE?: () => `0x${string}`
  availableLiquidity?: () => bigint
  drawdownLimit?: () => bigint
  getLPAddresses?: () => readonly `0x${string}`[]
  getLPBalance?: (lp: `0x${string}`) => readonly [bigint, bigint]
  getPSPPosition?: (psp: `0x${string}`) => readonly [bigint, bigint, boolean]
  getPoolState?: () => readonly [bigint, bigint, bigint, bigint, bigint]
  getRoleAdmin?: (role: `0x${string}`) => `0x${string}`
  hasRole?: (role: `0x${string}`, account: `0x${string}`) => boolean
  initialized?: () => boolean
  investorAPY?: () => bigint
  lpAddresses?: (arg0: bigint) => `0x${string}`
  lpBalances?: (arg0: `0x${string}`) => bigint
  lpYieldClaimable?: (arg0: `0x${string}`) => bigint
  nextRequestId?: () => bigint
  pendingDrawdowns?: (arg0: bigint) => readonly [`0x${string}`, bigint, boolean]
  pspPositions?: (arg0: `0x${string}`) => readonly [bigint, bigint, boolean]
  pspRatePerDay?: () => bigint
  supportsInterface?: (interfaceId: `0x${string}`) => boolean
  totalLiquidity?: () => bigint
  usdc?: () => `0x${string}`
  yieldReserve?: () => `0x${string}`
} & Pick<ContractMock<typeof PoolABI>, 'writeReport'>

export function newPoolMock(address: Address, evmMock: EvmMock): PoolMock {
  return addContractMock(evmMock, { address, abi: PoolABI }) as PoolMock
}

