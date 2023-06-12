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

import { AssetInfo } from '@alephium/sdk'
import { explorer } from '@alephium/web3'
import { AddressBalance } from '@alephium/web3/dist/src/api/api-explorer'

export type AddressHash = string

export type AddressBalanceResult = {
  addressHash: AddressHash
  balance: string
  lockedBalance: string
}

export type AddressAssetsResult = {
  addressHash: AddressHash
  assets: (AddressBalance & Partial<AssetInfo>)[]
}

export type AddressTransactionNumberResult = {
  addressHash: AddressHash
  txNumber: number
}

export type AddressTransactionsResult = {
  addressHash: AddressHash
  transactions: explorer.Transaction[]
}
