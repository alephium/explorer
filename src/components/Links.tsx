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

import dayjs from 'dayjs'
import { ExternalLink } from 'lucide-react'
import { FC } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import styled, { css } from 'styled-components'

import Amount from '@/components/Amount'
import LockTimeIcon from '@/components/LockTimeIcon'
import { useGlobalContext } from '@/contexts/global'
import { AssetAmount } from '@/types/assets'
import { getAssetInfo } from '@/utils/assets'
import { smartHash } from '@/utils/strings'

interface TightLinkProps extends LinkProps {
  maxWidth: string
  text: string
}

export const SimpleLink: FC<LinkProps> = ({ children, ...props }) => <StyledLink {...props}>{children}</StyledLink>

export const TightLink: FC<TightLinkProps> = ({ maxWidth, text, ...props }) => (
  <div style={{ maxWidth: maxWidth, display: 'flex', overflow: 'hidden' }}>
    <StyledLink
      {...props}
      data-tip={text}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      {text}
    </StyledLink>
  </div>
)

export const TightLinkStrict: FC<TightLinkProps> = ({ maxWidth, text, ...props }) => (
  <div style={{ maxWidth: maxWidth, display: 'flex', overflow: 'hidden' }}>
    <StyledLink {...props} data-tip={text}>
      {smartHash(text)}
    </StyledLink>
  </div>
)

interface AddressLinkProps {
  maxWidth?: string
  address: string
  txHashRef?: string
  amounts?: AssetAmount[]
  lockTime?: number
  flex?: boolean
  className?: string
}

const AddressLinkBase = ({
  maxWidth = 'auto',
  address,
  txHashRef,
  amounts,
  lockTime,
  flex,
  className
}: AddressLinkProps) => {
  const isLocked = lockTime && dayjs(lockTime).isAfter(dayjs())
  const { networkType } = useGlobalContext()

  const renderAmount = (amount: AssetAmount) => {
    const assetInfo = getAssetInfo({ assetId: amount.id, networkType })
    return <Amount key={amount.id} value={amount.amount} suffix={assetInfo?.symbol} decimals={assetInfo?.decimals} />
  }

  return (
    <div className={className}>
      <TightLink to={`/addresses/${address}`} maxWidth={maxWidth} text={address} />
      {txHashRef && (
        <TxLink to={`/transactions/${txHashRef}`} data-tip={txHashRef}>
          <ExternalLink size={12} />
        </TxLink>
      )}
      {isLocked && <LockTimeIcon timestamp={lockTime} />}
      {amounts !== undefined && (
        <AmountsContainer flex={flex}>
          <Amounts>{amounts.map((a) => renderAmount(a))}</Amounts>
        </AmountsContainer>
      )}
    </div>
  )
}

export const AddressLink = styled(AddressLinkBase)`
  padding: 3px 0;
  display: flex;
  width: 100%;
  display: flex;

  ${({ flex }) =>
    flex &&
    css`
      align-items: center;
    `}
`

const AmountsContainer = styled.div<Pick<AddressLinkProps, 'flex'>>`
  color: ${({ theme }) => theme.font.primary};
  margin-left: 8px;
  display: flex;
  gap: 10px;
  align-items: center;
  ${({ flex }) =>
    flex &&
    css`
      flex: 1;
      justify-content: flex-end;
      text-align: right;
    `}
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const TxLink = styled(Link)`
  padding: 3px;
  background-color: ${({ theme }) => theme.bg.accent};
  display: flex;
  border-radius: 4px;
  margin-left: 4px;
`
const StyledLink = styled(Link)`
  white-space: nowrap;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.6pt;
`
