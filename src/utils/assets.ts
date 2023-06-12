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
import { NodeProvider } from '@alephium/web3'

import { NetworkType } from '@/types/network'

export const getAssetMetadata = async ({
  assetId,
  networkType,
  nodeClient
}: {
  assetId: string
  networkType: NetworkType
  nodeClient: NodeProvider
}): Promise<AssetInfo> => {
  const knownTokenData =
    assetId === ALPH.id ? ALPH : TokensMetadata[networkType].tokens.tokens.find((tm) => tm.id === assetId)

  if (knownTokenData) {
    return { ...knownTokenData, verified: true }
  } else {
    return { id: assetId, ...(await nodeClient.fetchStdTokenMetaData(assetId)), verified: false }
  }
}
