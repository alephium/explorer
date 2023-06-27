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

import { FungibleTokenMetaData, NFTMetaData } from '@alephium/web3'
import { createAsyncThunk } from '@reduxjs/toolkit'

import client from '@/api/client'
import {
  AssetBase,
  FungibleTokenMetadata,
  isFungibleTokenMetadata,
  isNFTMetadata,
  NFTMetadataStored
} from '@/types/assets'

export const syncUnknownAssetsInfo = createAsyncThunk(
  'assets/syncUnknownTokensInfo',
  async (
    unknownAssets: AssetBase[]
  ): Promise<{ fungibleTokens: FungibleTokenMetadata[]; nfts: NFTMetadataStored[] }> => {
    const results = await Promise.allSettled(
      unknownAssets.map(async (a) => {
        let fungibleTokenMetadata: Partial<FungibleTokenMetaData> = {}
        let NFTMetadata: Partial<NFTMetaData> = {}

        if (a.type === 'fungible') {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { totalSupply, ...rest } = await client.node.fetchFungibleTokenMetaData(a.id)
          fungibleTokenMetadata = rest
        } else if (a.type === 'non-fungible') {
          NFTMetadata = await client.node.fetchNFTMetaData(a.id)
        }

        return { id: a.id, verified: false, ...fungibleTokenMetadata, ...NFTMetadata }
      })
    )

    return (
      results.filter(({ status }) => status === 'fulfilled') as PromiseFulfilledResult<
        FungibleTokenMetadata | NFTMetadataStored
      >[]
    ).reduce(
      (acc, v) => {
        if (isFungibleTokenMetadata(v.value)) {
          return { ...acc, fungibleTokens: [...acc.fungibleTokens, v.value] }
        } else if (isNFTMetadata(v.value)) {
          return { ...acc, nfts: [...acc.nfts, v.value] }
        } else {
          return acc
        }
      },
      { fungibleTokens: [] as FungibleTokenMetadata[], nfts: [] as NFTMetadataStored[] }
    )
  }
)
