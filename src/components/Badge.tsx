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

import { abbreviateAmount } from 'alephium-js/dist/lib/numbers'
import { FC } from 'react'
import styled, { DefaultTheme } from 'styled-components'

import Amount from './Amount'

type BadgeType = 'plus' | 'minus' | 'neutral' | 'neutralHighlight'

interface BadgeProps {
  type: BadgeType
  content?: JSX.Element | string | undefined
  className?: string
  amount?: string | bigint | undefined
  prefix?: string
  floatRight?: boolean
  minWidth?: number
}

let Badge: FC<BadgeProps> = ({ content, className, amount, prefix, minWidth, floatRight = false }) => {
  return (
    <div
      className={className}
      data-tip={amount ? `${abbreviateAmount(BigInt(amount), true)} א` : null}
      style={{ float: floatRight ? 'right' : 'left', minWidth }}
    >
      {prefix && <span>{prefix}</span>}
      {amount ? <Amount value={BigInt(amount)} /> : content}
    </div>
  )
}

const getBadgeColor = (badgeType: BadgeType, theme: DefaultTheme) => {
  let backgroundColor
  let color

  switch (badgeType) {
    case 'plus':
      backgroundColor = 'rgba(93, 203, 126, 0.12)'
      color = theme.valid
      break
    case 'minus':
      backgroundColor = 'rgba(243, 113, 93, 0.1)'
      color = theme.alert
      break
    case 'neutral':
      backgroundColor = theme.bgTertiary
      color = theme.textPrimary
      break
    case 'neutralHighlight':
      backgroundColor = 'rgba(101, 16, 247, 1)'
      color = 'rgba(255, 255, 255, 1)'
  }

  return { backgroundColor, color }
}

Badge = styled(Badge)`
  background-color: ${({ type, theme }) => getBadgeColor(type, theme).backgroundColor};
  color: ${({ type, theme }) => getBadgeColor(type, theme).color};
  text-align: center;
  padding: 5px 10px;
  border-radius: 3px;
  font-weight: 600;
  float: left;
  white-space: nowrap;
`

export default Badge
