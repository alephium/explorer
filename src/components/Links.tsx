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

interface TightLinkProps extends LinkProps {
  maxCharacters: number
  text: string
}

export const TightLink: React.FC<TightLinkProps> = ({maxCharacters, text, ...props}) => {
  //const [formatedText, setFormatedText] = useState(props.text)
  const midLength = Math.round(maxCharacters / 2)

  const formatedText = text.substr(0, midLength) + '...' + text.substr(text.length - midLength, text.length)

  return (
    <Link {...props}>{formatedText}</Link>
  )
}

interface InputAddressLinkProps {
  maxCharacters?: number
  address: string
  txHashRef: string
}

export const InputAddressLink: FC<InputAddressLinkProps> = ({ maxCharacters = 12, address, txHashRef }) => {
  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <TightLink to={`/addresses/${address}`} maxCharacters={maxCharacters} text={address} />
      <Link to={`/transactions/${txHashRef}`} style={{ marginLeft: '8px' }}><ExternalLink size={12}/></Link>
    </div>
  )
}

interface OutputAddressLinkProps {
  address: string,
  maxCharacters?: number
}

export const OutputAddressLink: FC<OutputAddressLinkProps> = ({ maxCharacters = 12, address }) => (
  <div><TightLink to={`/addresses/${address}`} maxCharacters={maxCharacters} text={address} /></div>
)
