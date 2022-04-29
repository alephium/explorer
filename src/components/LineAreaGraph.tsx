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
import styled from 'styled-components'

import SkeletonLoader from './SkeletonLoader'

interface Props {
  series: number[]
  categories: number[]
  isLoading: boolean
}

const LineAreaGraph = ({ series, categories, isLoading }: Props) => {
  const options = {
    chart: {
      toolbar: {
        show: false
      },
      dropShadow: {
        enabled: true
      }
    },
    xaxis: {
      categories,
      axisTicks: {
        color: 'rgba(255, 255, 255, 0.09)'
      },
      axisBorder: {
        color: 'rgba(255, 255, 255, 0.09)'
      },
      labels: {
        style: {
          colors: 'rgba(255, 255, 255, 0.65)'
        }
      }
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.09)'
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
                offset: 66,
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
    <Chart options={options} series={_series} type="area" />
  )
}

const SkeletonLoaderStyled = styled(SkeletonLoader)`
  padding: 20px 20px 34px;
`

export default LineAreaGraph
