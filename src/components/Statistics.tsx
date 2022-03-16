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

import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import StatisticBlock from './StatisticBlock'

const ONE_DAY = 1000 * 60 * 60 * 24

const Block = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  margin-bottom: 62px;
  gap: 2%;
`

const Statistics: FC<Record<string, never>> = () => {
  const { client } = useGlobalContext()
  const [hashrate, setHashrate] = useState('')
  const [supply, setSupply] = useState('')
  const [circulating, setCirculating] = useState('')
  const [transactions, setTransactions] = useState('')
  const [blocks, setBlocks] = useState('')
  const [chains, setChains] = useState('')

  useEffect(() => {
    client?.charts
      .getChartsHashrates({
        fromTs: new Date().getTime() - ONE_DAY,
        toTs: new Date().getTime(),
        interval: 'hourly'
      })
      .then((res) => res.json())
      .then((hashrates) => setHashrate(hashrates[0] || ''))

    client?.infos
      .getInfosHeights()
      .then((res) => res.json())
      .then((value) => setBlocks(value[0] || ''))

    client?.infos
      .getInfosSupplyTotalAlph()
      .then((res) => res.text())
      .then((value) => setSupply(value))

    client?.infos
      .getInfosSupplyCirculatingAlph()
      .then((res) => res.text())
      .then((value) => setCirculating(value))

    client?.infos
      .getInfosTotalTransactions()
      .then((res) => res.text())
      .then((value) => setTransactions(value))
    setTransactions('')

    client?.infos
      .getInfosChains()
      .then((res) => res.text())
      .then((value) => setChains(value))
  }, [client, hashrate, supply, circulating, transactions, blocks, chains])

  return (
    <Block>
      <StatisticBlock
        title={'Hashrate'}
        primary={<div>{hashrate}</div>}
        secondary={<div>GH/s</div>}
        isLoading={false}
      />
      <StatisticBlock
        title={'Supply'}
        primary={<div>230.7B / 520B</div>}
        secondary={<div>44% is circulating</div>}
        isLoading={false}
      />
      <StatisticBlock
        title={'Transactions'}
        primary={<div>341.8B</div>}
        secondary={<div>Total</div>}
        isLoading={false}
      />
      <StatisticBlock
        title={'Blocks'}
        primary={<div>123&apos;923</div>}
        secondary={<div>Total</div>}
        isLoading={false}
      />
      <StatisticBlock
        title={'Active chains'}
        primary={<div>4</div>}
        secondary={<div>Out of 16</div>}
        isLoading={false}
      />
    </Block>
  )
}

export default Statistics
