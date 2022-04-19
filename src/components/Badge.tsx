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

import styled, { css, DefaultTheme } from 'styled-components'

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

let Badge = ({ content, className, amount, prefix, minWidth, floatRight = false }: BadgeProps) => (
  <div className={className} style={{ float: floatRight ? 'right' : 'left', minWidth }}>
    {prefix && <span>{prefix}</span>}
    {amount ? <Amount value={BigInt(amount)} /> : content}
  </div>
)

const getBadgeColor = (badgeType: BadgeType, theme: DefaultTheme) => {
  let backgroundColor
  let color
  let borderColor = 'transparent'

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
      backgroundColor = theme.bgSecondary
      color = theme.textPrimary
      borderColor = theme.borderPrimary
  }

  return { backgroundColor, color, borderColor }
}

Badge = styled(Badge)`
  ${({ type, theme }) => {
    const { color, backgroundColor, borderColor } = getBadgeColor(type, theme)

    return css`
      color: ${color};
      background-color: ${backgroundColor};
      border: 1px solid ${borderColor};
    `
  }}

  text-align: center;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: 600;
  float: left;
  white-space: nowrap;
`

export default Badge
