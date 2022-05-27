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
import { usePageVisibility } from 'react-page-visibility'
import { useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components'

import Card from '../../components/Card'
import NakedChart from '../../components/Charts/NakedChart'
import Counter from '../../components/Counter'
import PageSwitch from '../../components/PageSwitch'
import SearchBar from '../../components/SearchBar'
import Section from '../../components/Section'
import StatisticTextual from '../../components/StatisticTextual'
import Table, { TDStyle } from '../../components/Table/Table'
import TableBody from '../../components/Table/TableBody'
import TableHeader from '../../components/Table/TableHeader'
import TableRow from '../../components/Table/TableRow'
import Timestamp from '../../components/Timestamp'
import Waves from '../../components/Wave/Waves'
import useInterval from '../../hooks/useInterval'
import usePageNumber from '../../hooks/usePageNumber'
import { useWindowSize } from '../../hooks/useWindowSize'
import { deviceBreakPoints, deviceSizes } from '../../style/globalStyles'
import { formatNumberForDisplay } from '../../utils/strings'
import useBlockListData from './useBlockListData'
import useStatisticsData from './useStatisticsData'

dayjs.extend(duration)

const HomePage = () => {
  const history = useHistory()
  const { width } = useWindowSize()
  const isAppVisible = usePageVisibility()
  const currentPageNumber = usePageNumber()

  const {
    getBlocks,
    blockPageLoading,
    data: { blockList }
  } = useBlockListData(currentPageNumber)

  const {
    fetchStatistics,
    data: {
      scalar: { hashrate, totalSupply, circulatingSupply, totalTransactions, totalBlocks, avgBlockTime },
      vector: { txPerDay }
    }
  } = useStatisticsData()

  // Polling
  useInterval(
    () => {
      fetchStatistics()

      if (currentPageNumber === 1) {
        getBlocks(currentPageNumber, false)
      }
    },
    10 * 1000,
    !isAppVisible
  )

  const [hashrateInteger, hashrateDecimal, hashrateSuffix] = formatNumberForDisplay(hashrate.value, 'hash')

  const currentSupplyPercentage =
    circulatingSupply.value && totalSupply.value && ((circulatingSupply.value / totalSupply.value) * 100).toPrecision(3)

  return (
    <StyledSection>
      {width && width > deviceSizes.mobile && (
        <Search>
          <Heading>Search</Heading>
          <SearchBar />
        </Search>
      )}
      <MainContent>
        <StatisticCards>
          <Heading>Our numbers</Heading>
          <StatisticsContainer>
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
                      <TextSecondary>
                        {totalSupply.value ? formatNumberForDisplay(totalSupply.value) : '-'}
                      </TextSecondary>
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
                <CardChartContainer>
                  <NakedChart series={txPerDay.value.series} />
                </CardChartContainer>
              </Card>
            </SectionStatisticsTextual>
          </StatisticsContainer>
        </StatisticCards>
        <LatestsBlocks>
          <Heading>Latest Blocks</Heading>
          <Content>
            <BlockListTable main isLoading={blockPageLoading} minHeight={498}>
              <TableHeader
                headerTitles={['Height', 'Timestamp', 'Txn', 'Chain index']}
                columnWidths={['20%', '30%', '20%', '25%']}
              />
              <TableBody tdStyles={TableBodyCustomStyles}>
                {blockList &&
                  blockList.blocks?.map((b) => (
                    <TableRow
                      key={b.hash}
                      onClick={() => {
                        history.push(`blocks/${b.hash}`)
                      }}
                    >
                      <td>
                        <BlockHeight>{b.height.toString()}</BlockHeight>
                      </td>
                      <td>
                        <Timestamp timeInMs={b.timestamp} />
                      </td>
                      <td>{b.txNumber}</td>
                      <td>
                        {b.chainFrom} → {b.chainTo}
                      </td>
                    </TableRow>
                  ))}
              </TableBody>
            </BlockListTable>
          </Content>
          <PageSwitch totalNumberOfElements={blockList?.total} />
        </LatestsBlocks>
      </MainContent>
      <Waves />
    </StyledSection>
  )
}

const StyledSection = styled(Section)`
  margin-top: -30px;
`

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 40px;
  align-self: center;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
    gap: 30px;
  }
`

const Heading = styled.h2``

const Search = styled.div`
  margin: 0 auto 7vh auto;
  width: 60%;
`

const StatisticCards = styled.div`
  flex: 1;
  min-width: 300px;
`

const StatisticsContainer = styled.div`
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

const CardChartContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
`

const TextPrimary = styled.span`
  color: ${({ theme }) => theme.textPrimary};
`

const TextSecondary = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`

const LatestsBlocks = styled.div`
  flex: 1;
  min-width: 300px;
`

const Content = styled.div``

const BlockListTable = styled(Table)`
  height: 498px;
`

const BlockHeight = styled.span`
  color: ${({ theme }) => theme.textAccent};
`

const TableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 4,
    style: css`
      font-feature-settings: 'tnum';
      font-weight: 600;
    `
  }
]

export default HomePage