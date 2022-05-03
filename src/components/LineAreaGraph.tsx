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

import Chart from 'react-apexcharts'
import styled, { useTheme } from 'styled-components'

import { formatNumberForDisplay } from '../utils/strings'
import SkeletonLoader from './SkeletonLoader'

type TooltipStyleArgs = {
  series: number[][]
  seriesIndex: number
  dataPointIndex: number
}

interface Props {
  series: number[]
  categories: (number | string)[]
  yAxisType: 'plain' | 'tx'
  xAxisType: 'datetime' | 'numeric' | 'category'
  isLoading: boolean
}

const formatYAxis =
  (type: Props['yAxisType']) =>
  (value: number): string => {
    if (type === 'tx') {
      const formattedParts = formatNumberForDisplay(value, 'quantity')
      const integer = formattedParts[0]
      const suffix = formattedParts[2]
      return (integer && integer + suffix) || ''
    }
    return value.toString()
  }

const formatXAxis =
  (type: Props['xAxisType']) =>
  (value: string | string[]): string => {
    const _value = Array.isArray(value) ? value[0] : value
    if (type === 'datetime') {
      return formatToMonthDay(new Date(_value))
    }
    return _value
  }

const fontSizeInPx = 12

function getOffsetXYAxisLabel(series: number[], type: Props['yAxisType']): number {
  const largestNumber = series.reduce((l, c) => Math.max(l, c), 0)
  const formatted = formatYAxis(type)(largestNumber)
  return formatted.length * fontSizeInPx
}

function formatToMonthDay(dt: Date): string {
  const month = dt.getMonth().toString().padStart(2, '0')
  const day = dt.getDay().toString().padStart(2, '0')
  return month + '/' + day
}

function formatToYearMonthDay(dt: Date): string {
  const year = dt.getFullYear()
  return year + '/' + formatToMonthDay(dt)
}

const LineAreaGraph = ({ series, categories, xAxisType, yAxisType, isLoading }: Props) => {
  const theme = useTheme()
  const options = {
    chart: {
      toolbar: {
        show: false
      }
    },
    xaxis: {
      type: xAxisType,
      categories,
      axisTicks: {
        color: theme.borderSecondary
      },
      axisBorder: {
        show: false
      },
      labels: {
        style: {
          colors: theme.textSecondary
        },
        formatter: formatXAxis(xAxisType)
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      floating: true,
      labels: {
        style: {
          colors: theme.textSecondary,
          fontSize: fontSizeInPx + 'px'
        },
        offsetY: -8,
        offsetX: getOffsetXYAxisLabel(series, yAxisType),
        formatter: formatYAxis(yAxisType)
      }
    },
    grid: {
      borderColor: theme.borderPrimary,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 2
      }
    },
    tooltip: {
      theme: false as unknown as string,
      custom: function ({ series, seriesIndex, dataPointIndex }: TooltipStyleArgs) {
        return `<div style="
          color: ${theme.textPrimary};
          border: 1px solid ${theme.borderSecondary};
          border-radius: 9px;
          box-shadow: ${theme.shadowPrimary};
          min-width: 121px;
        ">
          <div style="display: flex; flex-direction: column;">
            <div style="
              background-color: ${theme.bgSecondary};
              padding: 9px 0px 5px 11px;
              border-bottom: 1px solid ${theme.borderSecondary};
              border-top-left-radius: 9px;
              border-top-right-radius: 9px;
            ">
              ${formatToYearMonthDay(new Date(categories[dataPointIndex]))}
            </div>
            <div style="
              background-color: ${theme.bgPrimary};
              padding: 10px 0px 11px 11px;
              font-weight: 700;
              border-bottom-left-radius: 9px;
              border-bottom-right-radius: 9px;
            ">
              ${series[seriesIndex][dataPointIndex]}
            </div>
          </div>
        </div>`
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3,
      fill: {
        type: 'gradient',
        gradient: {
          type: 'horizontal',
          colorStops: [
            [
              {
                offset: 0,
                color: '#0085FF',
                opacity: 1
              },
              {
                offset: 33,
                color: '#FF2E92',
                opacity: 1
              },
              {
                offset: 80,
                color: '#FFAC2F',
                opacity: 1
              },
              {
                offset: 99,
                color: '#FFFFFF',
                opacity: 1
              }
            ]
          ]
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        type: 'vertical',
        colorStops: [
          [
            {
              offset: 0,
              color: '#F48116',
              opacity: 1.0
            },
            {
              offset: 70,
              color: '#6510F8',
              opacity: 0.2
            },
            {
              offset: 97,
              color: '#6510F8',
              opacity: 0.0
            }
          ]
        ]
      }
    }
  }

  const _series = [{ name: 'series-1', data: series }]
  return isLoading ? (
    <SkeletonLoaderStyled heightInPx={136} />
  ) : (
    <Chart options={options} series={_series} type="area" width="710" />
  )
}

const SkeletonLoaderStyled = styled(SkeletonLoader)`
  padding: 20px 20px 34px;
`

export default LineAreaGraph
