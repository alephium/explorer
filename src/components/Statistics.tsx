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

import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import { deviceBreakPoints } from '../style/globalStyles'
import { abbreviateValue, SUFFICES_QUANTITY, SUFFICES_TIME, thousandsSeparation } from '../utils/strings'
import StatisticBlock from './StatisticBlock'

const ONE_DAY = 1000 * 60 * 60 * 24

interface Props {
  refresh: boolean
}

const Statistics = ({ refresh }: Props) => {
  const { client } = useGlobalContext()
  const [hashrate, setHashrate] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [circulating, setCirculating] = useState('')
  const [transactions, setTransactions] = useState('')
  const [blocks, setBlocks] = useState('')
  const [avgBlockTime, setAvgBlockTime] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const currentSupplyPercentage = ((parseFloat(circulating) / parseFloat(totalSupply)) * 100).toPrecision(3)
  const hashrateInteger = thousandsSeparation(parseInt(hashrate))
  const hashrateDecimal = parseFloat(hashrate).toFixed(2).split('.')[1]

  useEffect(() => {
    if (!client) return

    const fetchData = async () => {
      const now = new Date().getTime()
      const yesterday = now - ONE_DAY

      await client.charts
        .getChartsHashrates({ fromTs: yesterday, toTs: now, 'interval-type': 'hourly' })
        .then(({ data }) => setHashrate(data.length > 0 ? data[0].value : '-'))

      await client.infos
        .getInfosHeights()
        .then(({ data }) => setBlocks(data.reduce((acc: number, { value }) => acc + value, 0).toString()))

      await client.infos
        .getInfosSupplyTotalAlph()
        .then((res) => res.text())
        .then((text) => setTotalSupply(text))

      await client.infos
        .getInfosSupplyCirculatingAlph()
        .then((res) => res.text())
        .then((text) => setCirculating(text))

      await client.infos
        .getInfosTotalTransactions()
        .then((res) => res.text())
        .then((text) => setTransactions(text))

      await client.infos
        .getInfosAverageBlockTimes()
        .then(({ data }) =>
          setAvgBlockTime(
            abbreviateValue(data.reduce((acc: number, { value }) => acc + value, 0.0) / data.length, SUFFICES_TIME)
          )
        )

      setIsLoading(false)
    }

    fetchData()
  }, [refresh, client])

  return (
    <Blocks>
      <StatisticBlock
        title="Hashrate"
        primary={
          hashrate !== '-' ? (
            <span>
              {hashrateInteger}.<TextSecondary>{hashrateDecimal}</TextSecondary>
            </span>
          ) : (
            '-'
          )
        }
        secondary="GH/s"
        isLoading={isLoading}
      />
      <StatisticBlock
        title="Supply"
        primary={
          <>
            <span>{abbreviateValue(parseInt(circulating), SUFFICES_QUANTITY)}</span>
            <TextSecondary> / </TextSecondary>
            <TextSecondary>{abbreviateValue(parseInt(totalSupply), SUFFICES_QUANTITY)}</TextSecondary>
          </>
        }
        secondary={
          <>
            <TextPrimary>{currentSupplyPercentage}%</TextPrimary> is circulating
          </>
        }
        isLoading={isLoading}
      />
      <StatisticBlock
        title="Transactions"
        primary={abbreviateValue(parseInt(transactions), SUFFICES_QUANTITY)}
        secondary="Total"
        isLoading={isLoading}
      />
      <StatisticBlock
        title="Blocks"
        primary={thousandsSeparation(parseInt(blocks))}
        secondary="Total"
        isLoading={isLoading}
      />
      <StatisticBlock
        title="Avg. block time"
        primary={avgBlockTime}
        secondary="Of all chains combined"
        isLoading={isLoading}
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
