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

import { formatAmountForDisplay, formatFiatAmountForDisplay } from '@alephium/sdk'
import styled from 'styled-components'

import AlefSymbol from '@/components/AlefSymbol'

interface AmountProps {
  value?: bigint | number
  decimals?: number
  isFiat?: boolean
  fadeDecimals?: boolean
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
  color?: string
  tabIndex?: number
  prefix?: string
  suffix?: string
  className?: string
}

const Amount = ({
  value,
  decimals,
  isFiat,
  className,
  fadeDecimals,
  fullPrecision = false,
  color,
  nbOfDecimalsToShow,
  prefix,
  suffix,
  tabIndex
}: AmountProps) => {
  let integralPart = ''
  let fractionalPart = ''
  let quantitySymbol = ''

  let amount =
    value !== undefined
      ? isFiat && typeof value === 'number'
        ? formatFiatAmountForDisplay(value)
        : formatAmountForDisplay({
            amount: value as bigint,
            amountDecimals: decimals,
            displayDecimals: nbOfDecimalsToShow,
            fullPrecision
          })
      : ''

  if (amount) {
    if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
      quantitySymbol = amount.slice(-1)
      amount = amount.slice(0, -1)
    }
    const amountParts = amount.split('.')
    integralPart = amountParts[0]
    fractionalPart = amountParts[1]
  }

  return (
    <span className={className} tabIndex={tabIndex ?? -1}>
      {prefix}
      {value !== undefined &&
        (fadeDecimals ? (
          <>
            <span>{integralPart}</span>
            <Decimals>.{fractionalPart}</Decimals>
            {quantitySymbol && <span>{quantitySymbol}</span>}
          </>
        ) : (
          `${integralPart}.${fractionalPart}`
        ))}

      <Suffix>{suffix && suffix !== 'ALPH' ? ` ${suffix}` : ' ALPH'}</Suffix>
    </span>
  )
}

export default styled(Amount)`
  color: ${({ color }) => color ?? 'inherit'};
  white-space: nowrap;
  font-weight: 800;
`

const Decimals = styled.span`
  opacity: 0.7;
`

const Suffix = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 500;
`
