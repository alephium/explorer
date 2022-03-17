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

import { PerChainValue } from 'alephium-js/dist/api/api-explorer'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
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
    Promise.all([
      client?.charts
        .getChartsHashrates({
          fromTs: new Date().getTime() - ONE_DAY,
          toTs: new Date().getTime(),
          'interval-type': 'hourly'
        })
        .then((res) => res.data)
        .then((values) => setHashrate(values[0]?.value || '-')),
      client?.infos
        .getInfosHeights()
        .then((res) => res.data)
        .then((values: PerChainValue[]) =>
          setBlocks(values.reduce((acc: number, { value }) => acc + value, 0).toString())
        ),
      client?.infos
        .getInfosSupplyTotalAlph()
        .then((res) => res.text())
        .then((value) => setTotalSupply(parseInt(value).toString())),
      client?.infos
        .getInfosSupplyCirculatingAlph()
        .then((res) => res.text())
        .then((value) => setCirculating(parseInt(value).toString())),
      client?.infos
        .getInfosTotalTransactions()
        .then((res) => res.text())
        .then((value) => setTransactions(value)),
      client?.infos
        .getInfosAverageBlockTimes()
        .then((res) => res.data)
        .then((values) =>
          setAvgBlockTime(
            abbreviateValue(values.reduce((acc: number, { value }) => acc + value, 0.0) / values.length, SUFFICES_TIME)
          )
        )
    ]).then(() => setIsLoading(false))
  }, [refresh, client])

  return (
    <Block>
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
    </Block>
  )
}

const Block = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  margin-bottom: 62px;
  gap: 2%;
`

const TextPrimary = styled.span`
  color: ${({ theme }) => theme.textPrimary};
`

const TextSecondary = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`

export default Statistics
