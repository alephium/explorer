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

import { HttpResponse } from '@alephium/sdk/api/explorer'
import { useCallback, useEffect, useState } from 'react'

import { useGlobalContext } from '../../contexts/global'

const ONE_DAY = 1000 * 60 * 60 * 24

interface Stat<T> {
  value: T
  isLoading: boolean
}

type StatScalar = Stat<number>
type StatScalarKeys =
  | 'hashrate'
  | 'totalSupply'
  | 'circulatingSupply'
  | 'totalTransactions'
  | 'totalBlocks'
  | 'avgBlockTime'

type StatVector = Stat<{ categories: number[]; series: number[] }>
type StatVectorKeys = 'txPerDay'

type StatsScalarData = { [key in StatScalarKeys]: StatScalar }
type StatsVectorData = { [key in StatVectorKeys]: StatVector }

const statScalarDefault = { value: 0, isLoading: true }
const statVectorDefault = { value: { categories: [], series: [] }, isLoading: true }

const useStatisticsData = () => {
  const { client } = useGlobalContext()

  const [statsScalarData, setStatsScalarData] = useState<StatsScalarData>({
    hashrate: statScalarDefault,
    totalSupply: statScalarDefault,
    circulatingSupply: statScalarDefault,
    totalTransactions: statScalarDefault,
    totalBlocks: statScalarDefault,
    avgBlockTime: statScalarDefault
  })

  const [statsVectorData, setStatsVectorData] = useState<StatsVectorData>({
    txPerDay: statVectorDefault
  })

  const updateStatsScalar = (key: StatScalarKeys, value: StatScalar['value']) => {
    setStatsScalarData((prevState) => ({ ...prevState, [key]: { value, isLoading: false } }))
  }

  const updateStatsVector = (key: StatVectorKeys, value: StatVector['value']) => {
    setStatsVectorData((prevState) => ({ ...prevState, [key]: { value, isLoading: false } }))
  }

  const fetchStatistics = useCallback(() => {
    if (!client) return

    const fetchAndUpdateStatsScalar = async (
      key: StatScalarKeys,
      fetchCall: () => Promise<HttpResponse<string | number>>
    ) => {
      await fetchCall()
        .then((res) => res.text())
        .then((text) => updateStatsScalar(key, parseInt(text)))
    }

    const fetchHashrateData = async () => {
      const now = new Date().getTime()
      const yesterday = now - ONE_DAY

      const { data } = await client.charts.getChartsHashrates({
        fromTs: yesterday,
        toTs: now,
        'interval-type': 'hourly'
      })

      if (data && data.length > 0) updateStatsScalar('hashrate', Number(data[0].value))
    }

    const fetchBlocksData = async () => {
      const { data } = await client.infos.getInfosHeights()
      if (data && data.length > 0)
        updateStatsScalar(
          'totalBlocks',
          data.reduce((acc: number, { value }) => acc + value, 0)
        )
    }

    const fetchAvgBlockTimeData = async () => {
      const { data } = await client.infos.getInfosAverageBlockTimes()
      if (data && data.length > 0)
        updateStatsScalar('avgBlockTime', data.reduce((acc: number, { value }) => acc + value, 0.0) / data.length)
    }

    const fetchTxPerDayData = async () => {
      // TODO: Replace with a real call.
      const { data } = await Promise.resolve({
        data: [
          { x: new Date('2022-05-01').getTime(), y: 1 },
          { x: new Date('2022-05-01').getTime(), y: 2 },
          { x: new Date('2022-05-02').getTime(), y: 40 },
          { x: new Date('2022-05-02').getTime(), y: 60 },
          { x: new Date('2022-05-04').getTime(), y: 80 },
          { x: new Date('2022-05-05').getTime(), y: 30 },
          { x: new Date('2022-05-06').getTime(), y: 40 },
          { x: new Date('2022-05-07').getTime(), y: 200 },
          { x: new Date('2022-05-08').getTime(), y: 600 }
        ]
      })

      if (data && data.length > 0)
        updateStatsVector(
          'txPerDay',
          data.reduce(
            (acc, { x, y }) => {
              acc.categories.push(x)
              acc.series.push(y)
              return acc
            },
            {
              series: [],
              categories: []
            } as { series: number[]; categories: number[] }
          )
        )
    }

    fetchHashrateData()
    fetchBlocksData()
    fetchAvgBlockTimeData()
    fetchTxPerDayData()
    fetchAndUpdateStatsScalar('totalSupply', client.infos.getInfosSupplyTotalAlph)
    fetchAndUpdateStatsScalar('circulatingSupply', client.infos.getInfosSupplyCirculatingAlph)
    fetchAndUpdateStatsScalar('totalTransactions', client.infos.getInfosTotalTransactions)
  }, [client])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  const { hashrate, totalSupply, circulatingSupply, totalTransactions, totalBlocks, avgBlockTime } = statsScalarData

  const { txPerDay } = statsVectorData
  console.log(txPerDay) // THIS WILL BE REMOVED IN FOLLOWING PR

  return {
    fetchStatistics,
    data: {
      scalar: {
        hashrate,
        totalSupply,
        circulatingSupply,
        totalTransactions,
        totalBlocks,
        avgBlockTime
      },
      vector: {
        txPerDay
      }
    }
  }
}

export default useStatisticsData
