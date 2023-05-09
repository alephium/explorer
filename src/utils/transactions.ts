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

import {
  calcTxAmountsDeltaForAddress,
  getDirection,
  isConsolidationTx,
  TransactionDirection,
  TransactionInfoType
} from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { AssetOutput, Output, Transaction } from '@alephium/web3/dist/src/api/api-explorer'

import { AssetAmount, TransactionInfo } from '@/types/assets'
import { NetworkType } from '@/types/network'
import { getAssetInfo } from '@/utils/assets'

export const getTransactionInfo = (tx: Transaction, addressHash: string, networkType: NetworkType): TransactionInfo => {
  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let outputs: Output[] = []
  let lockTime: Date | undefined
  let tokens: Required<AssetAmount>[] = []

  outputs = tx.outputs ?? outputs
  const { alph: alphAmount, tokens: tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

  amount = alphAmount
  tokens = tokenAmounts.map((token) => ({ ...token, amount: token.amount }))

  if (isConsolidationTx(tx)) {
    direction = 'out'
    infoType = 'move'
  } else if (isSwap(amount, tokens)) {
    direction = 'swap'
    infoType = 'swap'
  } else {
    direction = getDirection(tx, addressHash)
    infoType = direction
  }

  lockTime = outputs.reduce(
    (a, b) => (a > new Date((b as AssetOutput).lockTime ?? 0) ? a : new Date((b as AssetOutput).lockTime ?? 0)),
    new Date(0)
  )
  lockTime = lockTime?.toISOString() === new Date(0).toISOString() ? undefined : lockTime

  const tokenAssets = [...tokens.map((token) => ({ ...token, ...getAssetInfo({ assetId: token.id, networkType }) }))]
  const assets = amount !== undefined ? [{ ...ALPH, amount }, ...tokenAssets] : tokenAssets

  return {
    assets,
    direction,
    infoType,
    outputs,
    lockTime
  }
}

// TODO: Add in SDK?
const isSwap = (alphAmout: bigint, tokensAmount: Required<AssetAmount>[]) => {
  const allAmounts = [alphAmout, ...tokensAmount.map((tokenAmount) => tokenAmount.amount)]
  const allAmountsArePositive = allAmounts.every((amount) => amount >= 0)
  const allAmountsAreNegative = allAmounts.every((amount) => amount <= 0)

  return !allAmountsArePositive && !allAmountsAreNegative
}
