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
import tinycolor from 'tinycolor2'

import {
  formatSeriesNumber,
  formatXAxis,
  formatYAxis,
  getOffsetXYAxisLabel,
  XAxisType,
  YAxisType
} from '../../utils/charts'
import { formatToYearMonthDay } from '../../utils/dates'

type TooltipStyleArgs = {
  series: number[][]
  seriesIndex: number
  dataPointIndex: number
}

interface LineAreaChartProps {
  series: number[]
  categories: (number | string)[]
  colors: [string, string]
  yAxisType: YAxisType
  xAxisType: XAxisType
}

const LineAreaChart = ({ series, categories, colors, xAxisType, yAxisType }: LineAreaChartProps) => {
  const theme = useTheme()
  const options: ApexCharts.ApexOptions = {
    chart: {
      toolbar: {
        show: false
      },
      animations: {
        enabled: false
      },
      zoom: {
        enabled: false
      }
    },
    xaxis: {
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
          fontSize: '12px'
        },
        offsetY: -8,
        offsetX: getOffsetXYAxisLabel(series, yAxisType),
        formatter: formatYAxis(yAxisType)
      }
    },
    grid: {
      borderColor: tinycolor(theme.borderPrimary).setAlpha(0.5).toString(),
      padding: {
        top: 0,
        right: 0
      },
      strokeDashArray: 5,
      position: 'front'
    },
    markers: {
      colors: theme.bgPrimary
    },
    tooltip: {
      theme: false as unknown as string,
      custom({ series, seriesIndex, dataPointIndex }: TooltipStyleArgs) {
        return `<div style="
          color: ${theme.textPrimary};
          background-color: ${theme.bgPrimary};
          min-width: 121px;
        ">
          <div style="display: flex; flex-direction: column;">
            <div style="
              background-color: ${theme.bgSecondary};
              padding: 9px 0px 5px 11px;
              border-bottom: 1px solid ${theme.borderSecondary};
            ">
              ${formatToYearMonthDay(new Date(categories[dataPointIndex]))}
            </div>
            <div style="
              padding: 10px 0px 11px 11px;
              font-weight: 700;
            ">
              ${formatSeriesNumber(yAxisType, series[seriesIndex][dataPointIndex])}
            </div>
          </div>
        </div>`
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: false
    },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        colorStops: [
          [
            {
              offset: 0,
              color: colors[0],
              opacity: 0.8
            },
            {
              offset: 100,
              color: colors[1],
              opacity: 0.8
            }
          ]
        ]
      }
    }
  }

  return <Chart height="100%" width="100%" options={options} series={[{ data: series }]} type="area" />
}

export default LineAreaChart
