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
import { find, flatMap, sortBy } from 'lodash'
import { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { assetsQueries } from '@/api/assets/assetsApi'
import { useAssetsMetadata } from '@/api/assets/assetsHooks'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableTabBar, { TabItem } from '@/components/Table/TableTabBar'
import { useQueriesData } from '@/hooks/useQueriesData'
import { AddressHash } from '@/types/addresses'

import NFTList from './NFTList'
import TokenList from './TokenList'

interface AssetListProps {
  addressHash: AddressHash
  addressBalance?: AddressBalance
  assetIds?: string[]
  limit?: number
  isLoading: boolean
  className?: string
}

const AssetList = ({ addressHash, addressBalance, assetIds, limit, isLoading, className }: AssetListProps) => {
  const { fungibleTokens, nfts } = useAssetsMetadata(assetIds)

  const knownAssetsIds = [...fungibleTokens, ...nfts].map((a) => a.id)
  const unknownAssetsIds = assetIds?.filter((id) => !knownAssetsIds.includes(id)) || []

  const tokenBalances = useQueriesData(
    fungibleTokens.map((a) => assetsQueries.balances.addressToken(addressHash, a.id))
  )

  const unknownAssetsBalances = useQueriesData(
    unknownAssetsIds.map((id) => ({
      ...assetsQueries.balances.addressToken(addressHash, id),
      enabled: unknownAssetsIds.length > 0
    }))
  )

  let tokensWithBalanceAndMetadata = flatMap(tokenBalances, (t) => {
    if (!t) return []

    const metadata = find(fungibleTokens, { id: t.id })

    if (metadata) {
      return [{ ...t, ...metadata, balance: BigInt(t.balance), lockedBalance: BigInt(t.lockedBalance) }]
    }

    return []
  })

  tokensWithBalanceAndMetadata = sortBy(tokensWithBalanceAndMetadata, [
    (t) => !t.verified,
    (t) => t.name.toLowerCase(),
    'id'
  ])

  // Add ALPH
  if (addressBalance && BigInt(addressBalance.balance) > 0) {
    tokensWithBalanceAndMetadata.unshift({
      ...ALPH,
      type: 'fungible',
      balance: BigInt(addressBalance.balance),
      lockedBalance: BigInt(addressBalance.lockedBalance),
      verified: true
    })
  }

  const unknownAssetsWithBalance = unknownAssetsIds?.flatMap((id) => {
    const assetBalance = unknownAssetsBalances.find((a) => a.id === id)

    if (assetBalance) {
      return { id, ...{ balance: BigInt(assetBalance.balance), lockedBalance: BigInt(assetBalance.lockedBalance) } }
    }

    return []
  })

  const tabs: TabItem[] = [
    {
      value: 'tokens',
      icon: '🪙',
      label: `Tokens (${tokensWithBalanceAndMetadata.length})`
    }
  ]

  if (nfts.length > 0) tabs.push({ value: 'nfts', label: `NFTs (${nfts.length})`, icon: '🖼️' })

  if (unknownAssetsIds.length > 0)
    tabs.push({ value: 'unknown', label: `Unknown (${unknownAssetsIds.length})`, icon: '❔' })

  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  useEffect(() => {
    currentTab && ReactTooltip.rebuild()
  }, [currentTab])

  useEffect(() => {
    addressHash && setCurrentTab(tabs[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressHash])

  return (
    <div className={className}>
      <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
      {isLoading ? (
        <EmptyListContainer>
          <SkeletonLoader height="60px" />
          <SkeletonLoader height="60px" />
        </EmptyListContainer>
      ) : tokensWithBalanceAndMetadata.length > 0 || nfts.length > 0 ? (
        {
          tokens: tokensWithBalanceAndMetadata && <TokenList limit={limit} tokens={tokensWithBalanceAndMetadata} />,
          nfts: nfts && <NFTList nfts={nfts} />,
          unknown: unknownAssetsWithBalance && <TokenList limit={limit} tokens={unknownAssetsWithBalance} />
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
