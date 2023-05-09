/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { TransactionDirection, TransactionInfoType } from '@alephium/sdk'
import { AddressBalance, Token } from '@alephium/sdk/api/explorer'
import { TokenInfo } from '@alephium/token-list'
import { Output } from '@alephium/web3/dist/src/api/api-explorer'

import { PartialBy } from '@/types/generics'

// TODO: Add in SDK?
export type TokenBalances = AddressBalance & { id: Token['id'] }

// TODO: Add in SDK?
// Same as TokenBalances, but amounts are in BigInt, useful for display purposes
export type TokenDisplayBalances = Omit<TokenBalances, 'balance' | 'lockedBalance'> & {
  balance: bigint
  lockedBalance: bigint
}

// TODO: Add in SDK?
export type Asset = TokenDisplayBalances & PartialBy<TokenInfo, 'symbol' | 'name'>

// TODO: Add in SDK?
export type AssetAmount = { id: Asset['id']; amount?: bigint }

// TODO: Add to SDK?
export type TransactionInfoAsset = PartialBy<Omit<Asset, 'balance' | 'lockedBalance'>, 'decimals'> &
  Required<AssetAmount>

// TODO: Add to SDK?
export type TransactionInfo = {
  assets: TransactionInfoAsset[]
  direction: TransactionDirection
  infoType: TransactionInfoType
  outputs: Output[]
  lockTime?: Date
}
