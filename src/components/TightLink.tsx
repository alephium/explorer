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

import React from 'react'
import { Link, LinkProps } from 'react-router-dom'

interface TightLinkProps extends LinkProps {
  maxCharacters: number
  text: string
}

const TightLink: React.FC<TightLinkProps> = (props) => {
  //const [formatedText, setFormatedText] = useState(props.text)
  const text = props.text
  const midLength = Math.round(props.maxCharacters / 2)

  const formatedText = text.substr(0, midLength) + '...' + text.substr(text.length - midLength, text.length)

  return (
    <Link {...props}>{formatedText}</Link>
  )
}

export default TightLink