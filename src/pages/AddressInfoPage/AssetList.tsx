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

import { TokenDisplayBalances } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { AddressBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { useQueries } from '@tanstack/react-query'
import _, { differenceBy, filter, sortBy } from 'lodash'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import client from '@/api/client'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableTabBar, { TabItem } from '@/components/Table/TableTabBar'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { syncUnknownAssetsInfo } from '@/store/assetsMetadata/assetsMetadataActions'
import { selectAllFungibleTokensMetadata, selectAllNFTsMetadata } from '@/store/assetsMetadata/assetsMetadataSelectors'
import { AddressHash } from '@/types/addresses'
import { AssetBase, FungibleTokenMetadataStored, NFTMetadataStored } from '@/types/assets'

import NFTList from './NFTList'
import TokenList from './TokenList'

interface AssetListProps {
  addressHash: AddressHash
  addressBalance?: AddressBalance
  assets: AssetBase[]
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

  const dispatch = useAppDispatch()

  const allAssetsMetadata = {
    fungibleTokens: useAppSelector(selectAllFungibleTokensMetadata),
    nfts: useAppSelector(selectAllNFTsMetadata)
  }

  // Fetch tokens balances
  const tokensWithBalances = _(
    useQueries({
      queries: assets
        .filter((a) => a.type === 'fungible')
        .map((t) => ({
          queryKey: ['tokensBalance', t.id],
          queryFn: () =>
            client.explorer.addresses
              .getAddressesAddressTokensTokenIdBalance(addressHash, t.id)
              .then((r) => ({ ...t, ...r }))
        }))
    })
  )
    .map('data')
    .compact()
    .value()

  // Merge token metadata and balances
  let tokensWithBalanceAndMetadata = tokensWithBalances.reduce(
    (acc: (TokenDisplayBalances & AssetBase & FungibleTokenMetadataStored)[], t) => {
      if (!t) return acc

      const metadata = allAssetsMetadata.fungibleTokens.find((i) => i.id === t.id)

      if (metadata) {
        acc.push({ ...t, ...metadata, balance: BigInt(t.balance), lockedBalance: BigInt(t.lockedBalance) })
      }

      return acc
    },
    []
  )

  const unknownTokens = differenceBy(
    tokensWithBalances,
    filter(tokensWithBalanceAndMetadata, ({ name }) => !!name),
    'id'
  )

  tokensWithBalanceAndMetadata = sortBy(tokensWithBalanceAndMetadata, [
    (t) => !t.verified,
    (t) => t.verified === undefined,
    (t) => t.name?.toLowerCase(),
    'id'
  ])

  if (addressBalance && BigInt(addressBalance.balance) > 0) {
    tokensWithBalanceAndMetadata.unshift({
      ...ALPH,
      balance: BigInt(addressBalance.balance),
      lockedBalance: BigInt(addressBalance.lockedBalance),
      type: 'fungible',
      verified: true
    })
  }

  // Merge NFTs metadata

  const nfts = assets?.filter((a) => a.type === 'non-fungible') || []

  const nftsWithMetadata = nfts.reduce<(AssetBase & NFTMetadataStored)[]>((acc, nft) => {
    const metadata = allAssetsMetadata.nfts.find((i) => i.id === nft.id)
    if (metadata) {
      acc.push({ ...nft, ...metadata })
    }
    return acc
  }, [])

  // Sync unknown tokens
  useEffect(() => {
    if (unknownTokens.length > 0) {
      dispatch(syncUnknownAssetsInfo(unknownTokens.map(({ id, type }) => ({ id, type }))))
    }
  }, [dispatch, unknownTokens])

  const unknownNFTs = differenceBy(nfts, allAssetsMetadata.nfts, 'id')

  // Sync unknown NFTs
  useEffect(() => {
    if (unknownNFTs.length > 0) {
      dispatch(syncUnknownAssetsInfo(unknownNFTs.map(({ id, type }) => ({ id, type }))))
    }
  }, [dispatch, unknownNFTs])

  return (
    <div className={className}>
      <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
      {isLoading ? (
        <EmptyListContainer>
          <SkeletonLoader height="60px" />
          <SkeletonLoader height="60px" />
        </EmptyListContainer>
      ) : tokensWithBalanceAndMetadata.length > 0 || nftsWithMetadata.length > 0 ? (
        {
          tokens: tokensWithBalanceAndMetadata && <TokenList limit={limit} tokens={tokensWithBalanceAndMetadata} />,
          nfts: nftsWithMetadata && <NFTList nfts={nftsWithMetadata} />
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
