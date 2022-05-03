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

import SkeletonLoader from './SkeletonLoader'

type TooltipStyleArgs = {
  series: any[]
  seriesIndex: number
  dataPointIndex: number
  w: any
}

interface Props {
  series: number[]
  categories: (number | string)[]
  type: 'datetime' | 'numeric' | 'category'
  isLoading: boolean
}

const LineAreaGraph = ({ series, categories, type, isLoading }: Props) => {
  const theme = useTheme()
  const options = {
    chart: {
      toolbar: {
        show: false
      }
    },
    xaxis: {
      type,
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
        formatter(value: any) {
          if (type === 'datetime') {
            const datetime = new Date(value)
            const month = datetime.getMonth().toString().padStart(2, '0')
            const day = datetime.getDay().toString().padStart(2, '0')
            return month + '/' + day
          }
          return value
        }
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      floating: true,
      labels: {
        style: {
          colors: theme.textSecondary
        },
        offsetY: -8,
        offsetX: 12
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
