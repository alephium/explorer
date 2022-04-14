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
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import { deviceBreakPoints } from '../style/globalStyles'
import { formatNumberForDisplay } from '../utils/strings'
import StatisticBlock from './StatisticBlock'

dayjs.extend(duration)

const ONE_DAY = 1000 * 60 * 60 * 24

interface Props {
  refresh: boolean
}

const Statistics = ({ refresh }: Props) => {
  const { client } = useGlobalContext()
  const [hashrate, setHashrate] = useState('')
  const [isHashrateLoading, setIsHashrateLoading] = useState(true)
  const [totalSupply, setTotalSupply] = useState<number>()
  const [isTotalSupplyLoading, setIsTotalSupplyLoading] = useState(true)
  const [circulating, setCirculating] = useState<number>()
  const [isCirculatingLoading, setIsCirculatingLoading] = useState(true)
  const [transactions, setTransactions] = useState<number>()
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true)
  const [blocks, setBlocks] = useState<number>()
  const [isBlocksLoading, setIsBlocksLoading] = useState(true)
  const [avgBlockTime, setAvgBlockTime] = useState<number>()
  const [isAvgBlockTimeLoading, setIsAvgBlockTimeLoading] = useState(true)

  const currentSupplyPercentage = circulating && totalSupply && ((circulating / totalSupply) * 100).toPrecision(3)

  useEffect(() => {
    if (!client) return

    const fetchHashrateData = async () => {
      const now = new Date().getTime()
      const yesterday = now - ONE_DAY

      await client.charts
        .getChartsHashrates({ fromTs: yesterday, toTs: now, 'interval-type': 'hourly' })
        .then(({ data }) => setHashrate(data.length > 0 ? data[0].value : ''))

      setIsHashrateLoading(false)
    }

    const fetchBlocksData = async () => {
      await client.infos
        .getInfosHeights()
        .then(({ data }) => setBlocks(data.reduce((acc: number, { value }) => acc + value, 0)))

      setIsBlocksLoading(false)
    }

    const fetchTotalSupplyData = async () => {
      await client.infos
        .getInfosSupplyTotalAlph()
        .then((res) => res.text())
        .then((text) => setTotalSupply(parseInt(text)))

      setIsTotalSupplyLoading(false)
    }

    const fetchCirculatingData = async () => {
      await client.infos
        .getInfosSupplyCirculatingAlph()
        .then((res) => res.text())
        .then((text) => setCirculating(parseInt(text)))

      setIsCirculatingLoading(false)
    }

    const fetchTransactionsData = async () => {
      await client.infos
        .getInfosTotalTransactions()
        .then((res) => res.text())
        .then((text) => setTransactions(parseInt(text)))

      setIsTransactionsLoading(false)
    }

    const fetchAvgBlockTimeData = async () => {
      await client.infos.getInfosAverageBlockTimes().then(({ data }) => {
        if (data.length > 0) setAvgBlockTime(data.reduce((acc: number, { value }) => acc + value, 0.0) / data.length)
      })

      setIsAvgBlockTimeLoading(false)
    }

    fetchHashrateData()
    fetchBlocksData()
    fetchTotalSupplyData()
    fetchCirculatingData()
    fetchTransactionsData()
    fetchAvgBlockTimeData()
  }, [refresh, client])

  const [hashrateInteger, hashrateDecimal, hashrateSuffix] = formatNumberForDisplay(Number(hashrate), 'hash')

  return (
    <Blocks>
      <StatisticBlock
        title="Hashrate"
        primary={hashrateInteger ? addApostrophes(hashrateInteger) + (hashrateDecimal ?? '') : '-'}
        secondary={`${hashrateSuffix}H/s`}
        isLoading={isHashrateLoading}
      />
      <StatisticBlock
        title="Supply"
        primary={
          <>
            <span>{circulating ? formatNumberForDisplay(circulating) : '-'}</span>
            <TextSecondary> / </TextSecondary>
            <TextSecondary>{totalSupply ? formatNumberForDisplay(totalSupply) : '-'}</TextSecondary>
          </>
        }
        secondary={
          currentSupplyPercentage ? (
            <>
              <TextPrimary>{currentSupplyPercentage}%</TextPrimary> is circulating
            </>
          ) : null
        }
        isLoading={isCirculatingLoading || isTotalSupplyLoading}
      />
      <StatisticBlock
        title="Transactions"
        primary={transactions ? formatNumberForDisplay(transactions) : '-'}
        secondary="Total"
        isLoading={isTransactionsLoading}
      />
      <StatisticBlock
        title="Blocks"
        primary={blocks ? addApostrophes(blocks.toString()) : '-'}
        secondary="Total"
        isLoading={isBlocksLoading}
      />
      <StatisticBlock
        title="Avg. block time"
        primary={avgBlockTime ? dayjs.duration(avgBlockTime).format('m[m] s[s]') : '-'}
        secondary="of all shards"
        isLoading={isAvgBlockTimeLoading}
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
