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

import { convertToPositive, formatAmountForDisplay, formatFiatAmountForDisplay } from '@alephium/sdk'
import styled from 'styled-components'

import { useAssetMetadata } from '@/api/assets/assetsHooks'

import AssetLogo from './AssetLogo'

interface AmountProps {
  assetId: string
  value?: bigint | number
  decimals?: number
  isFiat?: boolean
  fadeDecimals?: boolean
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
  color?: string
  overrideSuffixColor?: boolean
  tabIndex?: number
  suffix?: string
  highlight?: boolean
  showPlusMinus?: boolean
  className?: string
}

const Amount = ({
  value,
  assetId,
  isFiat,
  className,
  fadeDecimals,
  fullPrecision = false,
  nbOfDecimalsToShow = 4,
  color,
  overrideSuffixColor,
  tabIndex,
  showPlusMinus = false
}: AmountProps) => {
  const assetMetadata = useAssetMetadata(assetId)

  let quantitySymbol = ''
  let amount = ''
  const isNegative = value && value < 0

  const assetType = assetMetadata.type
  const isUnknownToken = assetType === undefined

  let decimals: number | undefined, suffix: string | undefined

  if (assetType === 'fungible') {
    decimals = assetMetadata.decimals
    suffix = assetMetadata.symbol

    if (value !== undefined) {
      amount = getAmount({ value, isFiat, decimals, nbOfDecimalsToShow, fullPrecision })

      if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
        quantitySymbol = amount.slice(-1)
        amount = amount.slice(0, -1)
      }
    }
  } else if (assetType === undefined) {
    amount = getAmount({ value, fullPrecision: true })
  }

  const [integralPart, fractionalPart] = amount.split('.')

  return (
    <span className={className} tabIndex={tabIndex ?? -1}>
      {assetType === 'fungible' ? (
        <>
          <NumberContainer
            data-tip={
              (!fullPrecision &&
                value &&
                getAmount({ value, isFiat, decimals, nbOfDecimalsToShow, fullPrecision: true })) ||
              undefined
            }
          >
            {showPlusMinus && <span>{isNegative ? '-' : '+'}</span>}
            {fadeDecimals ? (
              <>
                <span>{integralPart}</span>
                {fractionalPart && <Decimals>.{fractionalPart}</Decimals>}
                {quantitySymbol && <span>{quantitySymbol}</span>}
              </>
            ) : fractionalPart ? (
              `${integralPart}.${fractionalPart}`
            ) : (
              integralPart
            )}
          </NumberContainer>
          <Suffix color={overrideSuffixColor ? color : undefined}> {suffix ?? 'ALPH'}</Suffix>
        </>
      ) : assetType === 'non-fungible' ? (
        <>
          {showPlusMinus && <span>{isNegative ? '-' : '+'}</span>}
          <NFTInlineLogo assetId={assetId} size={15} showTooltip />
        </>
      ) : isUnknownToken ? (
        <RawAmount data-tip={convertToPositive(value as bigint)}>{value?.toString()}</RawAmount>
      ) : (
        '-'
      )}
    </span>
  )
}

const getAmount = ({ value, isFiat, decimals, nbOfDecimalsToShow, fullPrecision }: Partial<AmountProps>) =>
  isFiat && typeof value === 'number'
    ? formatFiatAmountForDisplay(value)
    : formatAmountForDisplay({
        amount: convertToPositive(value as bigint),
        amountDecimals: decimals,
        displayDecimals: nbOfDecimalsToShow,
        fullPrecision
      })

export default styled(Amount)`
  color: ${({ color, highlight, value, theme }) =>
    color
      ? color
      : highlight && value !== undefined
      ? value < 0
        ? theme.font.highlight
        : theme.global.valid
      : 'inherit'};
  white-space: nowrap;
  font-weight: 800;
`

const NumberContainer = styled.span``

const Decimals = styled.span`
  opacity: 0.7;
`

const Suffix = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 500;
`

const RawAmount = styled.div`
  display: inline-block;
  max-width: 120px;
  text-overflow: ellipsis;
  overflow: hidden;
  vertical-align: bottom;
`

const NFTInlineLogo = styled(AssetLogo)`
  display: inline-block;
  margin-left: 2px;
  transform: translateY(3px);
`
