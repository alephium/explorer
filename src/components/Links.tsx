// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import React, { FC } from 'react'
import { ExternalLink } from 'react-feather'
import { Link, LinkProps } from 'react-router-dom'
import styled from 'styled-components'
import Amount from './Amount'
import { smartHash } from '../utils/util'
import JSBI from 'jsbi'

interface TightLinkProps extends LinkProps {
  maxWidth: string
  text: string
}

export const TightLinkStrict: React.FC<TightLinkProps> = ({ maxWidth, text, ...props }) => {
  return (
    <div style={{ maxWidth: maxWidth, display: 'flex', overflow: 'hidden' }}>
      <StyledLink {...props} data-tip={text}>
        {smartHash(text)}
      </StyledLink>
    </div>
  )
}

export const TightLink: React.FC<TightLinkProps> = ({ maxWidth, text, ...props }) => {
  return (
    <div style={{ maxWidth: maxWidth, display: 'flex', overflow: 'hidden' }}>
      <StyledLink {...props} data-tip={text}>
        {text}
      </StyledLink>
    </div>
  )
}

interface AddressLinkProps {
  maxWidth?: string
  address: string
  txHashRef?: string
  amount?: JSBI
}

export const AddressLink: FC<AddressLinkProps> = ({ maxWidth = 'auto', address, txHashRef, amount }) => {
  return (
    <AddressWrapper>
      <TightLink to={`/addresses/${address}`} maxWidth={maxWidth} text={address} />
      {amount !== undefined && (
        <OutputValue>
          (<Amount value={amount} />)
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
  color: ${({ theme }) => theme.textSecondary};
  margin-left: 8px;
`

const TxLink = styled(Link)`
  margin-left: 8px;
`
const StyledLink = styled(Link)`
  white-space: nowrap;
  font-family: 'Roboto Mono';
  font-size: 13.3px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
`

const AddressWrapper = styled.div`
  padding: 3px 0;
  display: flex;
  width: 100%;
`
