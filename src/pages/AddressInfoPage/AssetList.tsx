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

import { motion } from 'framer-motion'
import { useState } from 'react'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import ClipboardButton from '@/components/Buttons/ClipboardButton'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableCellAmount from '@/components/Table/TableCellAmount'
import TableTabBar, { TabItem } from '@/components/Table/TableTabBar'
import { AddressHash } from '@/types/addresses'
import { Asset } from '@/types/assets'

interface AssetListProps {
  assets?: Asset[]
  limit?: number
  isLoading: boolean
  addressHash?: AddressHash
  tokensTabTitle?: string
  nftsTabTitle?: string
  className?: string
}

const AssetList = ({ assets, limit, isLoading, tokensTabTitle, nftsTabTitle, className }: AssetListProps) => {
  const tabs = [
    { value: 'tokens', label: tokensTabTitle ?? 'Tokens' },
    { value: 'nfts', label: nftsTabTitle ?? 'NFTs' }
  ]
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  return (
    <div className={className}>
      {isLoading ? (
        <SkeletonLoader heightInPx={250} />
      ) : (
        <>
          {assets && assets?.length > 0 ? (
            <>
              <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
              {
                {
                  tokens: <TokenList limit={limit} assets={assets} />,
                  nfts: <NFTList />
                }[currentTab.value]
              }
            </>
          ) : (
            <NoAssetsMessage>No assets yet</NoAssetsMessage>
          )}
        </>
      )}
    </div>
  )
}

interface TokenListProps {
  assets?: Asset[]
  limit?: number
  className?: string
}

const TokenList = ({ assets, limit, className }: TokenListProps) => {
  const theme = useTheme()

  if (!assets) return null

  const displayedAssets = limit ? assets.slice(0, limit) : assets

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
                  <UnknownTokenIdText>{asset.id}</UnknownTokenIdText>
                  <TokenIdClipboardButton textToCopy={asset.id} />
                </UnknownTokenId>
              )}
            </TokenSymbol>
          </NameColumn>
          <TableCellAmount>
            <TokenAmount value={asset.balance} suffix={asset.symbol ?? '???'} decimals={asset.decimals} />
            {asset.lockedBalance > 0 ? (
              <TokenAmountSublabel>
                {'Available '}
                <Amount
                  value={asset.balance - asset.lockedBalance}
                  suffix={asset.symbol ?? '???'}
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

const NoAssetsMessage = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  padding: 15px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const UnknownTokenId = styled.div`
  display: flex;
`

const UnknownTokenIdText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`

const TokenIdClipboardButton = styled(ClipboardButton)`
  flex-shrink: 0;
  width: 10px;
`
