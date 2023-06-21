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

import { Asset } from '@alephium/sdk'
import { AddressBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import client from '@/api/client'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import HashEllipsed from '@/components/HashEllipsed'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableCellAmount from '@/components/Table/TableCellAmount'
import TableTabBar, { TabItem } from '@/components/Table/TableTabBar'
import { useAppSelector } from '@/hooks/redux'
import { selectAllFungibleTokensMetadata } from '@/store/assetsMetadata/assetsMetadataSelectors'
import { AddressHash } from '@/types/addresses'
import { AssetBase } from '@/types/assets'
import { sortBy } from 'lodash'
import { ALPH } from '@alephium/token-list'

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
    { value: 'tokens', label: tokensTabTitle ?? 'Tokens' },
    { value: 'nfts', label: nftsTabTitle ?? 'NFTs' }
  ]
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  const assetsInfo = {
    fungibleTokens: useAppSelector(selectAllFungibleTokensMetadata),
    nfts: useAppSelector(selectAllFungibleTokensMetadata)
  }

  const [tokenBalances, setTokenBalances] = useState<(AddressBalance & { id: string })[]>([])

  // Fetch tokens balances
  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!assets) return

      const balances = await Promise.all(
        assets
          .filter((a) => a.type === 'fungible')
          .map(async (a) => ({
            id: a.id,
            ...(await client.explorer.addresses.getAddressesAddressTokensTokenIdBalance(addressHash, a.id))
          }))
      )
      setTokenBalances(balances)
    }
    fetchTokenBalances()
  }, [addressHash, assets])

  // Merge asset infos
  let tokensWithBalance = (tokenBalances.map((a) => ({
    ...a,
    balance: BigInt(a.balance),
    lockedBalance: BigInt(a.lockedBalance),
    ...assetsInfo.fungibleTokens.find((i) => i.id === a.id)
  })) ?? []) as Asset[]

  tokensWithBalance = sortBy(tokensWithBalance, [
    (t) => !t.verified,
    (t) => t.verified === undefined,
    (t) => t.name?.toLowerCase(),
    'id'
  ])

  if (addressBalance && parseInt(addressBalance.balance) > 0) {
    tokensWithBalance.unshift({
      ...ALPH,
      balance: BigInt(addressBalance.balance),
      lockedBalance: BigInt(addressBalance.lockedBalance)
    })
  }

  /*
  const unknownAssets = assets.filter((a) => !a.name)

  useEffect(() => {
    if (!unknownAssetsSynced.current && unknownAssets.length > 0) {
      dispatch(syncUnknownAssetsInfo(unknownAssets.map((a) => a.id)))
      unknownAssetsSynced.current = true
    }
  }, [dispatch, unknownAssets])
  */

  return (
    <div className={className}>
      <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
      {isLoading ? (
        <EmptyListContainer>
          <SkeletonLoader height="60px" />
          <SkeletonLoader height="60px" />
        </EmptyListContainer>
      ) : assets && assets?.length > 0 ? (
        {
          tokens: <TokenList limit={limit} tokens={tokensWithBalance} />,
          nfts: <NFTList />
        }[currentTab.value]
      ) : (
        <EmptyListContainer>No assets yet</EmptyListContainer>
      )}
    </div>
  )
}

interface TokenListProps {
  tokens?: Asset[]
  limit?: number
  className?: string
}

const TokenList = ({ tokens, limit, className }: TokenListProps) => {
  const theme = useTheme()

  if (!tokens) return null

  const displayedAssets = limit ? tokens.slice(0, limit) : tokens

  return (
    <motion.div className={className}>
      {displayedAssets.map((asset) => (
        <AssetRow key={asset.id}>
          <AssetLogoStyled asset={asset} size={30} />
          <NameColumn>
            <TokenName>{asset.name || 'Unknown token'}</TokenName>
            <TokenSymbol>
              {asset.symbol ?? (
                <UnknownTokenId>
                  <HashEllipsed hash={asset.id} />
                </UnknownTokenId>
              )}
            </TokenSymbol>
          </NameColumn>
          <TableCellAmount>
            <TokenAmount
              value={asset.balance}
              suffix={asset.symbol}
              decimals={asset.decimals}
              isUnknownToken={!asset.symbol}
            />
            {asset.lockedBalance > 0 ? (
              <TokenAmountSublabel>
                {'Available '}
                <Amount
                  value={asset.balance - asset.lockedBalance}
                  suffix={asset.symbol}
                  color={theme.font.tertiary}
                  decimals={asset.decimals}
                />
              </TokenAmountSublabel>
            ) : !asset.name ? (
              <TokenAmountSublabel>Raw amount</TokenAmountSublabel>
            ) : undefined}
          </TableCellAmount>
        </AssetRow>
      ))}
    </motion.div>
  )
}

const NFTList = () => (
  <motion.div style={{ padding: 30 }}>
    <div>Coming soon.</div>
  </motion.div>
)

export default styled(AssetList)`
  margin-bottom: 35px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  overflow: hidden;
  border-radius: 12px;
`

const AssetRow = styled.div`
  display: flex;
  padding: 15px 20px;
  align-items: center;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const AssetLogoStyled = styled(AssetLogo)`
  margin-right: 20px;
`

const TokenName = styled.span`
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TokenSymbol = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  max-width: 150px;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const TokenAmount = styled(Amount)`
  font-size: 14px;
`

const TokenAmountSublabel = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
`

const NameColumn = styled(Column)`
  margin-right: 50px;
`

const EmptyListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: ${({ theme }) => theme.font.secondary};
  padding: 15px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const UnknownTokenId = styled.div`
  display: flex;
`
