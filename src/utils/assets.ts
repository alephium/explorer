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

import { calcTxAmountsDeltaForAddress } from '@alephium/sdk'
import { Transaction } from '@alephium/sdk/api/explorer'
import TokensMetadata, { ALPH } from '@alephium/token-list'

import { NetworkType } from '@/types/network'

import { convertToPositive } from './numbers'

export const getAssetInfo = ({ assetId, networkType }: { assetId: string; networkType: NetworkType }) =>
  TokensMetadata[networkType].tokens.find((tm) => tm.id === assetId)

export const getAddressAssetsWithAmounts = ({
  transaction,
  addressHash,
  networkType
}: {
  transaction: Transaction
  addressHash: string
  networkType: NetworkType
}) => {
  const { alph: alphAmount, tokens: tokenAmounts } = calcTxAmountsDeltaForAddress(transaction, addressHash)
  const amount = convertToPositive(alphAmount)
  const tokens = tokenAmounts.map((token) => ({ ...token, amount: convertToPositive(token.amount) }))
  const tokenAssets = [...tokens.map((token) => ({ ...token, ...getAssetInfo({ assetId: token.id, networkType }) }))]
  return amount !== undefined ? [{ ...ALPH, amount }, ...tokenAssets] : tokenAssets
}
