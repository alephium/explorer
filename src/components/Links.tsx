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
import styled from 'styled-components'

import Amount from '@/components/Amount'
import LockTimeIcon from '@/components/LockTimeIcon'
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
  amount?: bigint
  lockTime?: number
}

export const AddressLink: FC<AddressLinkProps> = ({ maxWidth = 'auto', address, txHashRef, amount, lockTime }) => {
  const isLocked = lockTime && dayjs(lockTime).isAfter(dayjs())

  return (
    <AddressWrapper>
      <TightLink to={`/addresses/${address}`} maxWidth={maxWidth} text={address} />
      {amount !== undefined && (
        <OutputValue>
          <span>
            (<Amount value={amount} />)
          </span>
          {isLocked && <LockTimeIcon timestamp={lockTime} />}
        </OutputValue>
      )}
      {txHashRef && (
        <TxLink to={`/transactions/${txHashRef}`} data-tip={txHashRef}>
          <ExternalLink size={12} />
        </TxLink>
      )}
    </AddressWrapper>
  )
}

const OutputValue = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  margin-left: 8px;
  display: flex;
  gap: 10px;
  align-items: center;
`

const TxLink = styled(Link)`
  margin-left: 8px;
`
const StyledLink = styled(Link)`
  white-space: nowrap;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.6pt;
`

const AddressWrapper = styled.div`
  padding: 3px 0;
  display: flex;
  width: 100%;
`
