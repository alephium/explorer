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
  amount?: string | bigint | undefined
  prefix?: string
  inline?: boolean
  floatRight?: boolean
  minWidth?: number
  className?: string
}

const Badge = ({ content, className, amount, prefix }: BadgeProps) => (
  <div className={className}>
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
      color = theme.textSecondary
      break
    case 'neutralHighlight':
      backgroundColor = theme.bgTertiary
      color = theme.textPrimary
      borderColor = theme.borderPrimary
  }

  return { backgroundColor, color, borderColor }
}

export default styled(Badge)`
  ${({ type, inline = false, floatRight = false, minWidth, theme }) => {
    const { color, backgroundColor, borderColor } = getBadgeColor(type, theme)

    return css`
      color: ${color};
      background-color: ${backgroundColor};
      border: 1px solid ${borderColor};
      display: ${inline ? 'inline' : 'block'};
      float: ${inline ? 'none' : floatRight ? 'right' : 'left'};
      min-width: ${minWidth ? minWidth + 'px' : 'auto'};
    `
  }}

  text-align: center;
  padding: 4px;
  border-radius: 5px;
  white-space: nowrap;
`
