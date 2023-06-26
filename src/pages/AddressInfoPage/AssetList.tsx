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

import { ALPH } from '@alephium/token-list'
import { AddressBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { useQueries, useQuery } from '@tanstack/react-query'
import { find, flatMap, sortBy } from 'lodash'
import { useState } from 'react'
import styled from 'styled-components'

import { assetsQueries } from '@/api/assetsApi'
import client from '@/api/client'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableTabBar, { TabItem } from '@/components/Table/TableTabBar'
import { AddressHash } from '@/types/addresses'
import { AssetBase } from '@/types/assets'
import { mapQueriesData, useQueriesData } from '@/utils/api'
import { getCategorizedAssetIds } from '@/utils/assets'

import NFTList from './NFTList'
import TokenList from './TokenList'

interface AssetListProps {
  addressHash: AddressHash
  addressBalance?: AddressBalance
  assets?: AssetBase[]
  limit?: number
  isLoading: boolean
  tokensTabTitle?: string
  nftsTabTitle?: string
  className?: string
}

const AssetList = ({
  addressHash,
  addressBalance,
  assets,
  limit,
  isLoading,
  tokensTabTitle,
  nftsTabTitle,
  className
}: AssetListProps) => {
  const tabs = [
    { value: 'tokens', label: tokensTabTitle ?? `Tokens` },
    { value: 'nfts', label: nftsTabTitle ?? 'NFTs' }
  ]
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  const { fungibleTokenIds, NFTIds } = getCategorizedAssetIds(assets)

  const { data: allVerifiedTokensMetadata } = useQuery(assetsQueries.metadata.allVerifiedTokens(client.networkType))
  const verifiedTokensMetadata = allVerifiedTokensMetadata?.filter((m) => fungibleTokenIds.includes(m.id)) || []

  const unverifiedTokensMetadata = mapQueriesData(
    useQueries({
      queries: fungibleTokenIds?.map((id) => assetsQueries.metadata.unverifiedFungibleToken(id))
    })
  )

  const unverifiedNFTsMetadata = mapQueriesData(
    useQueries({
      queries: NFTIds?.map((id) => assetsQueries.metadata.unverifiedNFT(id))
    })
  )

  const tokenBalances = mapQueriesData(
    useQueries({
      queries: fungibleTokenIds?.map((id) => assetsQueries.balances.addressToken(addressHash, id))
    })
  )

  let tokensWithBalanceAndMetadata = flatMap(tokenBalances, (t) => {
    if (!t) return []

    const metadata = find([...verifiedTokensMetadata, ...unverifiedTokensMetadata], { id: t.id })

    if (metadata) {
      return [{ ...t, ...metadata, balance: BigInt(t.balance), lockedBalance: BigInt(t.lockedBalance) }]
    }

    return []
  })

  tokensWithBalanceAndMetadata = sortBy(tokensWithBalanceAndMetadata, [
    (t) => !t.verified,
    (t) => t.verified === undefined,
    (t) => t.name?.toLowerCase(),
    'id'
  ])

  // Add ALPH
  if (addressBalance && BigInt(addressBalance.balance) > 0) {
    tokensWithBalanceAndMetadata.unshift({
      ...ALPH,
      balance: BigInt(addressBalance.balance),
      lockedBalance: BigInt(addressBalance.lockedBalance),
      verified: true
    })
  }

  return (
    <div className={className}>
      <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
      {isLoading ? (
        <EmptyListContainer>
          <SkeletonLoader height="60px" />
          <SkeletonLoader height="60px" />
        </EmptyListContainer>
      ) : tokensWithBalanceAndMetadata.length > 0 || unverifiedNFTsMetadata.length > 0 ? (
        {
          tokens: tokensWithBalanceAndMetadata && <TokenList limit={limit} tokens={tokensWithBalanceAndMetadata} />,
          nfts: unverifiedNFTsMetadata && <NFTList nfts={unverifiedNFTsMetadata} />
        }[currentTab.value]
      ) : (
        <EmptyListContainer>No assets yet</EmptyListContainer>
      )}
    </div>
  )
}

export default styled(AssetList)`
  margin-bottom: 35px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  overflow: hidden;
  border-radius: 12px;
`

const EmptyListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: ${({ theme }) => theme.font.secondary};
  padding: 15px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
`
