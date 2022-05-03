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

import { addApostrophes } from '@alephium/sdk'
import { HttpResponse } from '@alephium/sdk/api/explorer'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import { deviceBreakPoints } from '../style/globalStyles'
import { formatNumberForDisplay } from '../utils/strings'
import Card from './Card'
import Counter from './Counter'
import LineAreaGraph from './LineAreaGraph'
import StatisticTextual from './StatisticTextual'

dayjs.extend(duration)

const ONE_DAY = 1000 * 60 * 60 * 24

interface Props {
  refresh: boolean
}

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

const Statistics = ({ refresh }: Props) => {
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

  useEffect(() => {
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
          { x: new Date('2022-05-05').getTime(), y: 300 },
          { x: new Date('2022-05-06').getTime(), y: 400 },
          { x: new Date('2022-05-06').getTime(), y: 200000 },
          { x: new Date('2022-05-08').getTime(), y: 10000000 }
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
  }, [refresh, client])

  const { hashrate, totalSupply, circulatingSupply, totalTransactions, totalBlocks, avgBlockTime } = statsScalarData
  const { txPerDay } = statsVectorData

  const [hashrateInteger, hashrateDecimal, hashrateSuffix] = formatNumberForDisplay(hashrate.value, 'hash')

  const currentSupplyPercentage =
    circulatingSupply.value && totalSupply.value && ((circulatingSupply.value / totalSupply.value) * 100).toPrecision(3)

  return (
    <Container>
      <SectionStatisticsTextual>
        <Card label="Hashrate">
          <StatisticTextual
            primary={hashrateInteger ? addApostrophes(hashrateInteger) + (hashrateDecimal ?? '') : '-'}
            secondary={`${hashrateSuffix}H/s`}
            isLoading={hashrate.isLoading}
          />
        </Card>
        <Card label="Supply">
          <StatisticTextual
            primary={
              <>
                <span>{circulatingSupply.value ? formatNumberForDisplay(circulatingSupply.value) : '-'}</span>
                <TextSecondary> / </TextSecondary>
                <TextSecondary>{totalSupply.value ? formatNumberForDisplay(totalSupply.value) : '-'}</TextSecondary>
              </>
            }
            secondary={
              currentSupplyPercentage ? (
                <>
                  <TextPrimary>{currentSupplyPercentage}%</TextPrimary> is circulating
                </>
              ) : null
            }
            isLoading={circulatingSupply.isLoading || totalSupply.isLoading}
          />
        </Card>
        <Card label="Transactions">
          <StatisticTextual
            primary={totalTransactions.value ? <Counter to={totalTransactions.value} /> : '-'}
            secondary="Total"
            isLoading={totalTransactions.isLoading}
          />
        </Card>
        <Card label="Blocks">
          <StatisticTextual
            primary={totalBlocks.value ? <Counter to={totalBlocks.value} /> : '-'}
            secondary="Total"
            isLoading={totalBlocks.isLoading}
          />
        </Card>
        <Card label="Avg. block time">
          <StatisticTextual
            primary={avgBlockTime.value ? dayjs.duration(avgBlockTime.value).format('m[m] s[s]') : '-'}
            secondary="of all shards"
            isLoading={avgBlockTime.isLoading}
          />
        </Card>
      </SectionStatisticsTextual>
      <SectionStatisticGraph>
        <Card label="Transactions per day">
          <LineAreaGraph
            yAxisType="tx"
            xAxisType="datetime"
            categories={txPerDay.value.categories}
            series={txPerDay.value.series}
            isLoading={txPerDay.isLoading}
          />
        </Card>
      </SectionStatisticGraph>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  gap: 39px;
`

const SectionStatisticsTextual = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 62px;
  gap: 27px;
  flex-wrap: wrap;
  > * {
    width: 200px;
  }

  @media ${deviceBreakPoints.tablet} {
    justify-content: center;

    > * {
      width: 200px;
    }
  }

  @media ${deviceBreakPoints.mobile} {
    > * {
      width: 100%;
    }
  }
`

const SectionStatisticGraph = styled.div`
  display: flex;
  height: fit-content;
`

const TextPrimary = styled.span`
  color: ${({ theme }) => theme.textPrimary};
`

const TextSecondary = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`

export default Statistics
