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

import styled, { useTheme } from 'styled-components'

import Amount from './Amount'

interface AmountDeltaProps {
  value: bigint | undefined
  showFullPrecision?: boolean
  className?: string
}

const AmountDelta = ({ value, showFullPrecision, className }: AmountDeltaProps) => {
  const theme = useTheme()
  const direction = value && value < BigInt(0) ? -1 : 1
  const absoluteValue = value && value < BigInt(0) ? value * BigInt(-1) : value

  return (
    <span className={className} style={direction === 1 ? { color: theme.valid } : undefined}>
      {direction === -1 ? '- ' : '+ '}
      <Amount value={absoluteValue} showFullPrecision={showFullPrecision} fadeDecimals />
    </span>
  )
}

export default styled(AmountDelta)`
  font-weight: 600;
`
