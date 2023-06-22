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
import { ALPH } from '@alephium/token-list'
import { AddressBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { differenceBy, sortBy } from 'lodash'
import { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import client from '@/api/client'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import HashEllipsed from '@/components/HashEllipsed'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableCellAmount from '@/components/Table/TableCellAmount'
import TableTabBar, { TabItem } from '@/components/Table/TableTabBar'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { syncUnknownAssetsInfo } from '@/store/assetsMetadata/assetsMetadataActions'
import { selectAllFungibleTokensMetadata, selectAllNFTsMetadata } from '@/store/assetsMetadata/assetsMetadataSelectors'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { AddressHash } from '@/types/addresses'
import { AssetBase, NFTFile, NFTMetadataStored } from '@/types/assets'

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

  const dispatch = useAppDispatch()

  const assetsMetadata = {
    fungibleTokens: useAppSelector(selectAllFungibleTokensMetadata),
    nfts: useAppSelector(selectAllNFTsMetadata)
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

  // Merge token metadata
  let tokensWithBalance = (tokenBalances.map((a) => ({
    ...a,
    balance: BigInt(a.balance),
    lockedBalance: BigInt(a.lockedBalance),
    ...assetsMetadata.fungibleTokens.find((i) => i.id === a.id)
  })) ?? []) as Asset[]

  tokensWithBalance = sortBy(tokensWithBalance, [
    (t) => !t.verified,
    (t) => t.verified === undefined,
    (t) => t.name?.toLowerCase(),
    'id'
  ])

  if (addressBalance && BigInt(addressBalance.balance) > 0) {
    tokensWithBalance.unshift({
      ...ALPH,
      balance: BigInt(addressBalance.balance),
      lockedBalance: BigInt(addressBalance.lockedBalance)
    })
  }

  const unknownTokens = tokensWithBalance.filter((a) => !a.name)

  // Sync unknown tokens
  useEffect(() => {
    if (unknownTokens.length > 0) {
      dispatch(syncUnknownAssetsInfo(unknownTokens.map((a) => ({ id: a.id, type: 'fungible' }))))
    }
  }, [dispatch, unknownTokens])

  const unknownNFTs = differenceBy(
    assets?.filter((a) => a.type === 'non-fungible'),
    assetsMetadata.nfts,
    'id'
  )

  // Sync unknown NFTs
  useEffect(() => {
    if (unknownNFTs.length > 0) {
      dispatch(syncUnknownAssetsInfo(unknownNFTs.map((a) => ({ id: a.id, type: 'non-fungible' }))))
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
      ) : tokensWithBalance.length > 0 ? (
        {
          tokens: <TokenList limit={limit} tokens={tokensWithBalance} />,
          nfts: <NFTList nfts={assetsMetadata.nfts} />
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

  const displayedTokens = limit ? tokens.slice(0, limit) : tokens

  return (
    <motion.div className={className}>
      {displayedTokens.map((token) => (
        <AssetRow key={token.id}>
          <AssetLogoStyled asset={token} size={30} />
          <NameColumn>
            <TokenName>{token.name || 'Unknown token'}</TokenName>
            <TokenSymbol>
              {token.symbol ?? (
                <UnknownTokenId>
                  <HashEllipsed hash={token.id} />
                </UnknownTokenId>
              )}
            </TokenSymbol>
          </NameColumn>
          <TableCellAmount>
            <TokenAmount
              value={token.balance}
              suffix={token.symbol}
              decimals={token.decimals}
              isUnknownToken={!token.symbol}
            />
            {token.lockedBalance > 0 ? (
              <TokenAmountSublabel>
                {'Available '}
                <Amount
                  value={token.balance - token.lockedBalance}
                  suffix={token.symbol}
                  color={theme.font.tertiary}
                  decimals={token.decimals}
                />
              </TokenAmountSublabel>
            ) : !token.name ? (
              <TokenAmountSublabel>Raw amount</TokenAmountSublabel>
            ) : undefined}
          </TableCellAmount>
        </AssetRow>
      ))}
    </motion.div>
  )
}

interface NFTListProps {
  nfts: NFTMetadataStored[]
}

const NFTList = ({ nfts }: NFTListProps) => (
  <NFTListStyled>
    {nfts.map((nft) => (
      <NFTItem key={nft.id} nft={nft} />
    ))}
  </NFTListStyled>
)

interface NFTItemProps {
  nft: NFTMetadataStored
}

const NFTItem = ({ nft }: NFTItemProps) => {
  const { data: nftData } = useQuery<NFTFile>({
    queryKey: ['nftData', nft.id],
    queryFn: () => fetch(nft.tokenUri).then((res) => res.json())
  })

  const desc = nftData?.description
  const cutDesc = desc && desc?.length > 500 ? nftData?.description.substring(0, 300) + '...' : desc

  return (
    <NFTItemStyled>
      <NFTPicture src={nftData?.image} alt={nftData?.description} />
      <NFTName>{nftData?.name}</NFTName>
      <NFTDescription>{cutDesc}</NFTDescription>
    </NFTItemStyled>
  )
}

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

const NFTListStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 15px;

  @media ${deviceBreakPoints.tablet} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${deviceBreakPoints.mobile} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${deviceBreakPoints.tiny} {
    grid-template-columns: repeat(1, 1fr);
  }
`

const NFTItemStyled = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 350px;
  background-color: ${({ theme }) => theme.bg.background1};
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border.primary};
`

const NFTPicture = styled.img`
  max-width: 100%;
  height: 75%;
  object-fit: cover;
`

const NFTName = styled.h2``

const NFTDescription = styled.span``
