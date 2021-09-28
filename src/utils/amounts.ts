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

import JSBI from 'jsbi'
import { Transaction } from '../types/api'

const MONEY_SYMBOL = ['', 'K', 'M', 'B', 'T']
const QUINTILLION = 1000000000000000000

export const truncateToDecimals = (num: number, dec = 2) => {
  const calcDec = Math.pow(10, dec)
  return Math.trunc(num * calcDec) / calcDec
}

const getNumberOfTrailingZeros = (numberArray: string[]) => {
  let numberOfZeros = 0

  for (let i = numberArray.length - 1; i >= 0; i--) {
    if (numberArray[i] === '0') {
      numberOfZeros++
    } else {
      break
    }
  }

  return numberOfZeros
}

const removeTrailingZeros = (numString: string) => {
  const numberArray = numString.split('')

  const numberOfZeros = getNumberOfTrailingZeros(numberArray)

  const numberArrayWithoutTrailingZeros = [...numberArray.slice(0, numberArray.length - numberOfZeros)]

  if (numberArrayWithoutTrailingZeros[numberArrayWithoutTrailingZeros.length - 1] === '.')
    numberArrayWithoutTrailingZeros.push('0')

  return numberArrayWithoutTrailingZeros.join().replace(/,/g, '')
}

export const abbreviateAmount = (baseNum: JSBI, showFullPrecision = false, nbOfDecimalsToShow?: number) => {
  const minDigits = 3

  if (JSBI.lessThanOrEqual(baseNum, JSBI.BigInt(0))) return '0.00'

  // For abbreviation, we don't need full precision and can work with number
  const alephNum = Number(baseNum) / QUINTILLION

  // what tier? (determines SI symbol)

  let tier = (Math.log10(alephNum) / 3) | 0

  const numberOfDigitsToDisplay = nbOfDecimalsToShow ? nbOfDecimalsToShow : minDigits

  if (tier < 0 || showFullPrecision) {
    return removeTrailingZeros(alephNum.toFixed(18)) // Keep full precision for very low numbers (gas etc.)
  } else if (tier === 0) {
    // Small number, low precision is ok
    return removeTrailingZeros(alephNum.toFixed(numberOfDigitsToDisplay).toString())
  } else if (tier >= MONEY_SYMBOL.length) {
    tier = MONEY_SYMBOL.length - 1
  }

  // get suffix and determine scale
  const suffix = MONEY_SYMBOL[tier]
  const scale = Math.pow(10, tier * 3)

  // Scale the bigNum
  // Here we need to be careful of precision issues
  const scaled = alephNum / scale

  return scaled.toFixed(numberOfDigitsToDisplay) + suffix
}

export function calAmountDelta(t: Transaction, id: string) {
  const inputAmount = t.inputs.reduce<JSBI>((acc, input) => {
    const inputAmount = JSBI.BigInt(input.amount)
    return input.address === id ? JSBI.add(acc, inputAmount) : acc
  }, JSBI.BigInt(0))
  const outputAmount = t.outputs.reduce<JSBI>((acc, output) => {
    const outputAmount = JSBI.BigInt(output.amount)
    return output.address === id ? JSBI.add(acc, outputAmount) : acc
  }, JSBI.BigInt(0))

  return JSBI.subtract(outputAmount, inputAmount)
}
