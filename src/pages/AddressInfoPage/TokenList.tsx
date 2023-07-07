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
import { Optional } from '@alephium/web3'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import HashEllipsed from '@/components/HashEllipsed'
import TableCellAmount from '@/components/Table/TableCellAmount'

interface TokenListProps {
  tokens?: Optional<Asset, 'decimals'>[]
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
            <TokenName>{token.name || <HashEllipsed hash={token.id} />}</TokenName>
            <TokenSymbol>{token.symbol ?? <UnknownAssetSublabel>Unknown asset</UnknownAssetSublabel>}</TokenSymbol>
          </NameColumn>
          {token.id !== ALPH.id && !token.logoURI && token.name && (
            <UnverifiedWarningIcon data-tip="Unverified token">
              <AlertCircle />
            </UnverifiedWarningIcon>
          )}
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

export default TokenList

const AssetRow = styled.div`
  display: flex;
  padding: 15px 20px;
  align-items: center;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
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
  max-width: 250px;
`

const TokenSymbol = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  max-width: 150px;
`

const TokenAmount = styled(Amount)`
  font-size: 14px;
`

const TokenAmountSublabel = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
`

const NameColumn = styled(Column)`
  margin-right: 20px;
`

const UnknownAssetSublabel = styled.div`
  display: flex;
`

const UnverifiedWarningIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  width: 18px;
  border-radius: 100%;
  font-size: 12px;
  font-weight: 800;
  color: ${({ theme }) => theme.global.warning};
  opacity: ${({ theme }) => (theme.name === 'dark' ? 0.4 : 0.7)};

  &:hover {
    opacity: ${({ theme }) => (theme.name === 'dark' ? 0.6 : 1)};
  }
`
