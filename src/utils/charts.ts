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

import { maxBy } from 'lodash'

import { formatToDay } from './dates'
import { formatNumberForDisplay } from './strings'

export type YAxisType = 'plain' | 'tx'
export type XAxisType = ApexXAxis['type']

export const formatYAxis =
  (type: YAxisType) =>
  (value: number): string => {
    if (type === 'tx') {
      const formattedParts = formatNumberForDisplay(value, 'quantity', 1)
      return formattedParts.join('') || ''
    }
    return value.toString()
  }

export const formatXAxis =
  (type: XAxisType) =>
  (value: string | string[]): string => {
    const _value = Array.isArray(value) ? (value.length > 0 ? value[0] : '') : value
    if (type === 'datetime') {
      if (typeof _value == 'string' || typeof _value == 'number') {
        return formatToDay(new Date(_value))
      }
    }
    return _value
  }

export const formatSeriesNumber = (type: YAxisType, value: number): string => {
  // TODO: Special formatting (TX/s, etc)
  if (type === 'tx') {
    return value.toString()
  }
  return value.toString()
}

export const getOffsetXYAxisLabel = (series: number[], type: YAxisType, fontSizeInPx = 12): number => {
  const longestValue = maxBy(series, (v) => formatYAxis(type)(v).length)
  return (formatYAxis(type)(longestValue || series[0]).length - 1) * fontSizeInPx
}
