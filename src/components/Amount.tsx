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

import { formatAmountForDisplay } from '@alephium/sdk'
import styled from 'styled-components'

interface AmountProps {
  value: bigint | undefined
  fadeDecimals?: boolean
  showFullPrecision?: boolean
  className?: string
}

const Amount = ({ value, className, fadeDecimals, showFullPrecision = false }: AmountProps) => {
  let integralPart = ''
  let fractionalPart = ''

  if (value !== undefined) {
    const amountParts = formatAmountForDisplay(value, showFullPrecision).split('.')
    integralPart = amountParts[0]
    fractionalPart = amountParts[1]
  }

  return (
    <span className={className} data-tip={value ? `${formatAmountForDisplay(BigInt(value), true)} א` : null}>
      {value !== undefined ? (
        fadeDecimals ? (
          <>
            <span>{integralPart}</span>
            <Decimals>.{fractionalPart}</Decimals>
          </>
        ) : (
          `${integralPart}.${fractionalPart}`
        )
      ) : (
        '-'
      )}
      {' ℵ'}
    </span>
  )
}

const Decimals = styled.span`
  opacity: 0.7;
`

export default styled(Amount)`
  font-feature-settings: 'tnum';
`
