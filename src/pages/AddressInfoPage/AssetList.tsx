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
import { useEffect, useMemo, useState } from 'react'
import { RiCopperDiamondLine, RiNftLine, RiQuestionLine } from 'react-icons/ri'
import ReactTooltip from 'react-tooltip'
import styled, { useTheme } from 'styled-components'

import { queries } from '@/api'
import { useAssetsMetadata } from '@/api/assets/assetsHooks'
import TableTabBar, { TabItem } from '@/components/Table/TableTabBar'
import { useQueriesData } from '@/hooks/useQueriesData'
import NFTList from '@/pages/AddressInfoPage/NFTList'
import TokenList from '@/pages/AddressInfoPage/TokenList'
import { AddressHash } from '@/types/addresses'
import { alphMetadata } from '@/utils/assets'

interface AssetListProps {
  addressHash: AddressHash
  addressBalance?: AddressBalance
  assetIds?: string[]
  limit?: number
  assetsLoading: boolean
  className?: string
}

const AssetList = ({ addressHash, addressBalance, assetIds, limit, assetsLoading, className }: AssetListProps) => {
  const { fungibleTokens, nfts, isLoading: assetsMetadataLoading } = useAssetsMetadata(assetIds)
  const theme = useTheme()

  const isLoading = assetsLoading || assetsMetadataLoading

  const knownAssetsIds = [...fungibleTokens, ...nfts].map((a) => a.id)
  const unknownAssetsIds = useMemo(
    () => assetIds?.filter((id) => !knownAssetsIds.includes(id)) || [],
    [assetIds, knownAssetsIds]
  )

  const { data: tokenBalances } = useQueriesData(
    fungibleTokens.map((a) => queries.assets.balances.addressToken(addressHash, a.id))
  )

  const { data: unknownAssetsBalances } = useQueriesData(
    unknownAssetsIds.map((id) => ({
      ...queries.assets.balances.addressToken(addressHash, id),
      enabled: unknownAssetsIds.length > 0
    }))
  )

  const tokensWithBalanceAndMetadata = useMemo(() => {
    const unsorted = flatMap(tokenBalances, (t) => {
      const metadata = find(fungibleTokens, { id: t.id })

      return metadata ? [{ ...t, ...metadata, balance: BigInt(t.balance), lockedBalance: BigInt(t.lockedBalance) }] : []
    })

    // Add ALPH
    if (addressBalance && BigInt(addressBalance.balance) > 0) {
      unsorted.unshift({
        ...alphMetadata,
        balance: BigInt(addressBalance.balance),
        lockedBalance: BigInt(addressBalance.lockedBalance)
      })
    }

    return sortBy(unsorted, [(t) => !t.verified, (t) => !t.name, (t) => t.name.toLowerCase(), 'id'])
  }, [addressBalance, fungibleTokens, tokenBalances])

  const unknownAssetsWithBalance = useMemo(
    () =>
      unknownAssetsIds.flatMap((id) => {
        const assetBalance = unknownAssetsBalances.find((a) => a.id === id)

        if (assetBalance) {
          return { id, ...{ balance: BigInt(assetBalance.balance), lockedBalance: BigInt(assetBalance.lockedBalance) } }
        }

        return []
      }),
    [unknownAssetsBalances, unknownAssetsIds]
  )

  const tabs: TabItem[] = [
    {
      value: 'tokens',
      icon: <RiCopperDiamondLine />,
      label: 'Tokens',
      length: tokensWithBalanceAndMetadata.length,
      loading: isLoading,
      highlightColor: '#0cbaff'
    },
    {
      value: 'nfts',
      label: 'NFTs',
      icon: <RiNftLine />,
      length: nfts.length,
      loading: isLoading,
      highlightColor: '#ffae0c'
    }
  ]

  if (!isLoading && unknownAssetsIds.length > 0)
    tabs.push({
      value: 'unknown',
      label: 'Unknown',
      icon: <RiQuestionLine size={14} />,
      length: unknownAssetsIds.length,
      loading: isLoading,
      highlightColor: theme.font.primary
    })

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
      {tokensWithBalanceAndMetadata.length > 0 || nfts.length > 0 ? (
        {
          tokens: tokensWithBalanceAndMetadata && (
            <TokenList limit={limit} tokens={tokensWithBalanceAndMetadata} isLoading={isLoading} />
          ),
          nfts: nfts && <NFTList nfts={nfts} isLoading={isLoading} />,
          unknown: unknownAssetsWithBalance && (
            <TokenList limit={limit} tokens={unknownAssetsWithBalance} isLoading={isLoading} />
          )
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
  border-radius: 9px;
`

const EmptyListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: ${({ theme }) => theme.font.secondary};
  padding: 15px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
`
