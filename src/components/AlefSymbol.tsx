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

import { CSSProperties } from 'react'
import styled from 'styled-components'

import alefSymbol from '../images/alef.svg'

interface AlefSymbolProps {
  className?: string
  style?: CSSProperties
}

const AlefSymbol = ({ className, style }: AlefSymbolProps) => (
  <span className={className}>
    <HiddenForCopying>&nbsp;ALPH</HiddenForCopying>
    <AlefSymbolSVG style={{ backgroundColor: 'currentColor', ...style }} />
  </span>
)

export default AlefSymbol

const HiddenForCopying = styled.span`
  font-size: 0;
`

const AlefSymbolSVG = styled.span`
  display: inline-block;
  font-size: 1em;
  width: 1em;
  height: 1em;
  -webkit-mask: url(${alefSymbol}) no-repeat 100% 100%;
  mask: url(${alefSymbol}) no-repeat 100% 100%;
  -webkit-mask-size: cover;
  mask-size: cover;
  background-color: ${({ color, theme }) => color || theme.textPrimary};
`
