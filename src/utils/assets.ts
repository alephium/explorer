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
import TokensMetadata, { ALPH } from '@alephium/token-list'
import { NodeProvider, Optional } from '@alephium/web3'

import { NetworkType } from '@/types/network'

export const getAssetMetadata = async ({
  assetId,
  networkType,
  nodeClient
}: {
  assetId: string
  networkType: NetworkType
  nodeClient: NodeProvider
}): Promise<Optional<AssetInfo, 'symbol' | 'decimals' | 'name'>> => {
  const knownTokenData =
    assetId === ALPH.id ? ALPH : TokensMetadata[networkType].tokens.tokens.find((tm) => tm.id === assetId)

  if (knownTokenData) {
    return { ...knownTokenData, verified: true }
  } else {
    try {
      const stdTokenMetadata = await nodeClient.fetchStdTokenMetaData(assetId)
      return { id: assetId, ...stdTokenMetadata, verified: false }
    } catch (e) {
      // We still want to display the asset even though we couldn't fetch data from the node
      console.error(e)
      return { id: assetId, verified: false }
    }
  }
}

export const getAssetListMetadata = async ({
  assetIds,
  networkType,
  nodeClient
}: {
  assetIds: string[]
  networkType: NetworkType
  nodeClient: NodeProvider
}): Promise<Optional<AssetInfo, 'symbol' | 'decimals' | 'name'>[]> =>
  await Promise.all(assetIds.map(async (id) => await getAssetMetadata({ assetId: id, networkType, nodeClient })))
