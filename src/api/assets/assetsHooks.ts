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

import { useQuery } from '@tanstack/react-query'
import { flatMap } from 'lodash'

import { useQueriesData } from '@/hooks/useQueriesData'

import client from '../client'
import { assetsQueries } from './assetsApi'

export const useAssetMetadata = (assetId: string) => {
  const { data: allVerifiedTokensMetadata } = useQuery(assetsQueries.metadata.allVerifiedTokens(client.networkType))
  const verifiedTokenMetadata = allVerifiedTokensMetadata?.find((m) => m.id === assetId)

  // If not a verfied token, find which type of asset it is
  const { data: assetBaseRaw } = useQuery({ ...assetsQueries.type.details(assetId), enabled: !verifiedTokenMetadata })
  const assetType = assetBaseRaw?.type

  const { data: unverifiedNFTMetadata } = useQuery({
    ...assetsQueries.metadata.unverifiedNFT(assetId),
    enabled: !verifiedTokenMetadata && assetType === 'non-fungible'
  })

  const { data: unverifiedFungibleTokenMetadata } = useQuery({
    ...assetsQueries.metadata.unverifiedFungibleToken(assetId),
    enabled: !verifiedTokenMetadata && assetType === 'fungible'
  })

  return (
    verifiedTokenMetadata ||
    unverifiedNFTMetadata ||
    unverifiedFungibleTokenMetadata || { id: assetId, type: 'unknown', verified: false }
  )
}

export const useAssetsMetadata = (assetIds: string[] = []) => {
  const { data: allVerifiedTokensMetadata, isLoading: verifiedTokenMetadataLoading } = useQuery(
    assetsQueries.metadata.allVerifiedTokens(client.networkType)
  )

  const verifiedTokensMetadata = allVerifiedTokensMetadata?.filter((m) => assetIds.includes(m.id)) || []

  const unverifiedAssetIds = assetIds.filter((id) => !verifiedTokensMetadata.some((vt) => vt.id === id))

  // Classify unverified assets
  const { data: unverifiedAssets, isLoading: unverifiedAssetsLoading } = useQueriesData(
    unverifiedAssetIds.map((id) => assetsQueries.type.details(id))
  )

  const { data: unverifiedTokensMetadata, isLoading: unverifiedTokensMetadataLoading } = useQueriesData(
    flatMap(unverifiedAssets, ({ id, type }) =>
      type === 'fungible' ? assetsQueries.metadata.unverifiedFungibleToken(id) : []
    )
  )

  const { data: unverifiedNFTsMetadata, isLoading: unverifiedNFTsMetadataLoading } = useQueriesData(
    flatMap(unverifiedAssets, ({ id, type }) =>
      type === 'non-fungible' ? assetsQueries.metadata.unverifiedNFT(id) : []
    )
  )

  return {
    fungibleTokens: [...verifiedTokensMetadata, ...unverifiedTokensMetadata],
    nfts: unverifiedNFTsMetadata,
    isLoading:
      verifiedTokenMetadataLoading ||
      unverifiedAssetsLoading ||
      unverifiedTokensMetadataLoading ||
      unverifiedNFTsMetadataLoading
  }
}
