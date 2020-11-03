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
import Tooltip from './Tooltip'

interface TightLinkProps extends LinkProps {
  maxCharacters: number
  text: string
}

export const TightLink: React.FC<TightLinkProps> = ({maxCharacters, text, ...props}) => {
  //const [formatedText, setFormatedText] = useState(props.text)
  const midLength = Math.round(maxCharacters / 2)

  const formatedText = text.substr(0, midLength) + '...' + text.substr(text.length - midLength, text.length)

  return (
    <>
      <StyledLink {...props} data-tip={text}>{formatedText}</StyledLink>
    </>
  )
}

interface AddressLinkProps {
  maxCharacters?: number
  address: string
  txHashRef?: string
  amount?: number
}

export const AddressLink: FC<AddressLinkProps> = ({ maxCharacters = 12, address, txHashRef, amount }) => {
  return (
    <AddressWrapper>
      <TightLink to={`/addresses/${address}`} maxCharacters={maxCharacters} text={address} />
      {amount && <OutputValue>(<Amount value={amount} />)</OutputValue>}
      {txHashRef && <TxLink to={`/transactions/${txHashRef}`} data-tip={txHashRef} ><ExternalLink size={12} /></TxLink>}
    </AddressWrapper>
  )
}

const OutputValue = styled.span`
  color: ${( {theme} ) => theme.textSecondary };
  margin-left: 8px;
`

const TxLink = styled(Link)`
  margin-left: 8px;
`

const StyledLink = styled(Link)`
  white-space: nowrap;
  font-family: 'Inconsolata';
  font-weight: 600;
`

const AddressWrapper = styled.div`
  padding: 3px 0;
`