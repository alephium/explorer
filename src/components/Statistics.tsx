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
import styled from 'styled-components'

import useStatisticsData from '../pages/HomePage/useStatisticsData'
import { deviceBreakPoints } from '../style/globalStyles'
import { formatNumberForDisplay } from '../utils/strings'
import Card from './Card'
import Counter from './Counter'
import StatisticTextual from './StatisticTextual'

dayjs.extend(duration)

interface Props {
  refresh: boolean
}

const Statistics = ({ refresh }: Props) => {
  const {
    scalar: { hashrate, totalSupply, circulatingSupply, totalTransactions, totalBlocks, avgBlockTime },
    vector: { txPerDay }
  } = useStatisticsData(refresh)

  console.log(txPerDay) // THIS WILL BE REMOVED IN FOLLOWING PR

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
        <Card label="Transactions">
          <StatisticTextual
            primary={totalTransactions.value ? <Counter to={totalTransactions.value} /> : '-'}
            secondary="Total"
            isLoading={totalTransactions.isLoading}
          />
        </Card>
      </SectionStatisticsTextual>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;

  @media ${deviceBreakPoints.tablet} {
    flex-direction: column;
  }
`

const SectionStatisticsTextual = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;

  @media ${deviceBreakPoints.tablet} {
    justify-content: center;

    > * {
      width: 200px;
    }
  }

  @media ${deviceBreakPoints.mobile} {
    gap: 20px;

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
