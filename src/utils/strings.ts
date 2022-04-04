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

export const smartHash = (hash: string) => {
  if (hash.length <= 16) return hash
  else return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8)
}

export const checkAddressValidity = (addressToTest: string) => {
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(addressToTest)
}

export const checkHexStringValidity = (stringToTest: string) => {
  return /^[a-fA-F0-9]+$/.test(stringToTest)
}

export const thousandsSeparation = (input: number): string =>
  input
    .toString()
    .split('')
    .reduce(
      (str, char, index, list) => (index > 0 && index < list.length - 1 && index % 2 === 0 ? '’' : '') + char + str,
      ''
    )

type Suffices = [number, string][]

export const SUFFICES_QUANTITY: Suffices = [
  [1000000000, 'B'],
  [1000000, 'M'],
  [1000, 'K']
]

export const SUFFICES_TIME: Suffices = [
  [1000 * 60 * 60, 'h'],
  [1000 * 60, 'm'],
  [1000, 's']
]

export const abbreviateValue = (n: number, suffices: Suffices, precision = 3): string =>
  suffices.reduce((cur: string | undefined, [magnitude, suffix]) => {
    if (cur !== undefined) return cur.toString()
    if (n / magnitude < 1.0) return cur
    return (n / magnitude).toPrecision(precision) + suffix
  }, undefined) || n.toString()
