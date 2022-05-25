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

import { ListBlocks } from '@alephium/sdk/api/explorer'
import { useCallback, useEffect, useState } from 'react'
import { usePageVisibility } from 'react-page-visibility'
import { useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components'

import PageSwitch from '../components/PageSwitch'
import SearchBar from '../components/SearchBar'
import Section from '../components/Section'
import Statistics from '../components/Statistics'
import Table, { TDStyle } from '../components/Table/Table'
import TableBody from '../components/Table/TableBody'
import TableHeader from '../components/Table/TableHeader'
import TableRow from '../components/Table/TableRow'
import Timestamp from '../components/Timestamp'
import Waves from '../components/Wave/Waves'
import { useGlobalContext } from '../contexts/global'
import useInterval from '../hooks/useInterval'
import usePageNumber from '../hooks/usePageNumber'
import { useWindowSize } from '../hooks/useWindowSize'
import { deviceBreakPoints, deviceSizes } from '../style/globalStyles'

const HomePage = () => {
  const [blockList, setBlockList] = useState<ListBlocks>()
  const [loading, setLoading] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)

  const history = useHistory()
  const isAppVisible = usePageVisibility()
  const { width } = useWindowSize()

  const { client } = useGlobalContext()

  // Default page
  const currentPageNumber = usePageNumber()

  const getBlocks = useCallback(
    async (pageNumber: number, manualFetch?: boolean) => {
      if (!client) return

      console.log('Fetching blocks...')

      manualFetch ? setManualLoading(true) : setLoading(true)
      const { data } = await client.blocks.getBlocks({ page: pageNumber, limit: 10 })

      // Check if manual fetching has been set in the meantime (overriding polling fetch)

      if (currentPageNumber !== pageNumber) {
        setLoading(false)
        return
      }

      if (data) {
        console.log('Number of block fetched: ' + data.blocks?.length)
        setBlockList(data)
      }

      manualFetch ? setManualLoading(false) : setLoading(false)
    },
    [client, currentPageNumber]
  )

  // Fetching Data when page number changes or page loads initially
  useEffect(() => {
    getBlocks(currentPageNumber, true)
  }, [getBlocks, currentPageNumber])

  // Polling
  useInterval(
    () => {
      if (currentPageNumber === 1 && !loading && !manualLoading) getBlocks(currentPageNumber)
    },
    10 * 1000,
    !isAppVisible
  )

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
          <Statistics refresh={loading} />
        </StatisticCards>
        <LatestsBlocks>
          <Heading>Latest Blocks</Heading>
          <Content>
            <BlockListTable main isLoading={manualLoading} minHeight={500}>
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
