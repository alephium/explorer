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
type StatVectorKeys = 'txPerDay' | 'hashratePerDay'

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
    txPerDay: statVectorDefault,
    hashratePerDay: statVectorDefault
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
      const fromTs = new Date().getTime() - 1000 * 60 * 60 * 24 * 30
      const toTs = new Date().getTime()
      const { data } = await client.charts.getChartsTransactionsCount({ fromTs, toTs, 'interval-type': 'daily' })
      if (data && data.length > 0)
        updateStatsVector(
          'txPerDay',
          data.reduce(
            (acc, { timestamp, totalCountAllChains }) => {
              acc.categories.push(timestamp)
              acc.series.push(totalCountAllChains)
              return acc
            },
            {
              series: [],
              categories: []
            } as { series: number[]; categories: number[] }
          )
        )
    }

    const fetchHashratePerDayData = async () => {
      const fromTs = new Date().getTime() - 1000 * 60 * 60 * 24 * 30
      const toTs = new Date().getTime()
      const { data } = await client.charts.getChartsHashrates({ fromTs, toTs, 'interval-type': 'daily' })
      if (data && data.length > 0)
        updateStatsVector(
          'hashratePerDay',
          data.reduce(
            (acc, { timestamp, hashrate }) => {
              acc.categories.push(timestamp)
              acc.series.push(parseInt(hashrate))
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
    fetchHashratePerDayData()
    fetchAndUpdateStatsScalar('totalSupply', client.infos.getInfosSupplyTotalAlph)
    fetchAndUpdateStatsScalar('circulatingSupply', client.infos.getInfosSupplyCirculatingAlph)
    fetchAndUpdateStatsScalar('totalTransactions', client.infos.getInfosTotalTransactions)
  }, [client])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  const { hashrate, totalSupply, circulatingSupply, totalTransactions, totalBlocks, avgBlockTime } = statsScalarData

  const { txPerDay, hashratePerDay } = statsVectorData

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
        txPerDay,
        hashratePerDay
      }
    }
  }
}

export default useStatisticsData
