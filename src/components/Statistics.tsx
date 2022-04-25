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
import Counter from './Counter'
import StatisticBlock from './StatisticBlock'

dayjs.extend(duration)

const ONE_DAY = 1000 * 60 * 60 * 24

interface Props {
  refresh: boolean
}

type Stat = { value: number; isLoading: boolean }
type StatKeys = 'hashrate' | 'totalSupply' | 'circulatingSupply' | 'totalTransactions' | 'totalBlocks' | 'avgBlockTime'
type StatsData = { [key in StatKeys]: Stat }

const statInitData = { value: 0, isLoading: true }

const Statistics = ({ refresh }: Props) => {
  const { client } = useGlobalContext()
  const [statsData, setStatsData] = useState<StatsData>({
    hashrate: statInitData,
    totalSupply: statInitData,
    circulatingSupply: statInitData,
    totalTransactions: statInitData,
    totalBlocks: statInitData,
    avgBlockTime: statInitData
  })

  const updateStats = (key: StatKeys, value: number) => {
    setStatsData((prevState) => ({ ...prevState, [key]: { value, isLoading: false } }))
  }

  useEffect(() => {
    if (!client) return

    const fetchAndUpdateStats = async (key: StatKeys, fetchCall: () => Promise<HttpResponse<string | number>>) => {
      await fetchCall()
        .then((res) => res.text())
        .then((text) => updateStats(key, parseInt(text)))
    }

    const fetchHashrateData = async () => {
      const now = new Date().getTime()
      const yesterday = now - ONE_DAY

      const { data } = await client.charts.getChartsHashrates({
        fromTs: yesterday,
        toTs: now,
        'interval-type': 'hourly'
      })

      if (data && data.length > 0) updateStats('hashrate', Number(data[0].value))
    }

    const fetchBlocksData = async () => {
      const { data } = await client.infos.getInfosHeights()
      if (data && data.length > 0)
        updateStats(
          'totalBlocks',
          data.reduce((acc: number, { value }) => acc + value, 0)
        )
    }

    const fetchAvgBlockTimeData = async () => {
      const { data } = await client.infos.getInfosAverageBlockTimes()
      if (data && data.length > 0)
        updateStats('avgBlockTime', data.reduce((acc: number, { value }) => acc + value, 0.0) / data.length)
    }

    fetchHashrateData()
    fetchBlocksData()
    fetchAvgBlockTimeData()
    fetchAndUpdateStats('totalSupply', client.infos.getInfosSupplyTotalAlph)
    fetchAndUpdateStats('circulatingSupply', client.infos.getInfosSupplyCirculatingAlph)
    fetchAndUpdateStats('totalTransactions', client.infos.getInfosTotalTransactions)
  }, [refresh, client])

  const { hashrate, totalSupply, circulatingSupply, totalTransactions, totalBlocks, avgBlockTime } = statsData

  const [hashrateInteger, hashrateDecimal, hashrateSuffix] = formatNumberForDisplay(hashrate.value, 'hash')

  const currentSupplyPercentage =
    circulatingSupply.value && totalSupply.value && ((circulatingSupply.value / totalSupply.value) * 100).toPrecision(3)

  return (
    <Blocks>
      <StatisticBlock
        title="Hashrate"
        primary={hashrateInteger ? addApostrophes(hashrateInteger) + (hashrateDecimal ?? '') : '-'}
        secondary={`${hashrateSuffix}H/s`}
        isLoading={hashrate.isLoading}
      />
      <StatisticBlock
        title="Supply"
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
      <StatisticBlock
        title="Transactions"
        primary={totalTransactions.value ? <Counter to={totalTransactions.value} /> : '-'}
        secondary="Total"
        isLoading={totalTransactions.isLoading}
      />
      <StatisticBlock
        title="Blocks"
        primary={totalBlocks.value ? <Counter to={totalBlocks.value} /> : '-'}
        secondary="Total"
        isLoading={totalBlocks.isLoading}
      />
      <StatisticBlock
        title="Avg. block time"
        primary={avgBlockTime.value ? dayjs.duration(avgBlockTime.value).format('m[m] s[s]') : '-'}
        secondary="of all shards"
        isLoading={avgBlockTime.isLoading}
      />
    </Blocks>
  )
}

const Blocks = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 62px;
  gap: 27px;

  @media ${deviceBreakPoints.tablet} {
    justify-content: center;
    flex-wrap: wrap;

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

const TextPrimary = styled.span`
  color: ${({ theme }) => theme.textPrimary};
`

const TextSecondary = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`

export default Statistics
