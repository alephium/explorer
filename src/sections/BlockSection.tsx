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
import { useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { TightLink } from '../components/Links'
import PageSwitch from '../components/PageSwitch'
import Section from '../components/Section'
import SectionTitle from '../components/SectionTitle'
import Statistics from '../components/Statistics'
import Table, { TDStyle } from '../components/Table/Table'
import TableBody from '../components/Table/TableBody'
import TableHeader from '../components/Table/TableHeader'
import TableRow from '../components/Table/TableRow'
import Timestamp from '../components/Timestamp'
import { useGlobalContext } from '../contexts/global'
import usePageNumber from '../hooks/usePageNumber'
import { useInterval } from '../utils/hooks'

const BlockSection = () => {
  const [blockList, setBlockList] = useState<ListBlocks>()
  const [loading, setLoading] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)
  const history = useHistory()

  const { client } = useGlobalContext()

  // Default page
  const currentPageNumber = usePageNumber()

  const getBlocks = useCallback(
    async (pageNumber: number, manualFetch?: boolean) => {
      if (!client) return

      console.log('Fetching blocks...')

      manualFetch ? setManualLoading(true) : setLoading(true)
      const { data } = await client.blocks.getBlocks({ page: pageNumber })

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
  useInterval(() => {
    if (currentPageNumber === 1 && !loading && !manualLoading) getBlocks(currentPageNumber)
  }, 10 * 1000)

  return (
    <Section>
      <Statistics refresh={loading} />
      <TitleAndLoader>
        <SectionTitle title="Latest Blocks" isLoading={loading || manualLoading} />
      </TitleAndLoader>
      <Content>
        <Table main scrollable noBorder isLoading={manualLoading} minHeight={950}>
          <TableHeader
            headerTitles={['Hash', 'Timestamp', 'Height', 'Txn', 'Chain index']}
            columnWidths={['20%', '20%', '20%', '20%', '20%']}
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
                    <TightLink to={`blocks/${b.hash}`} text={b.hash} maxWidth="150px" />
                  </td>
                  <td>
                    <Timestamp timeInMs={b.timestamp} />
                  </td>
                  <td>{b.height}</td>
                  <td>{b.txNumber}</td>
                  <td>
                    {b.chainFrom} → {b.chainTo}
                  </td>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Content>
      <PageSwitch totalNumberOfElements={blockList?.total} />
    </Section>
  )
}

const TitleAndLoader = styled.div`
  position: relative;
`

const Content = styled.div`
  margin-top: 30px;
`

const TableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 3,
    style: css`
      font-feature-settings: 'tnum';
      color: ${({ theme }) => theme.textAccent};
      font-weight: 400;
    `
  },
  {
    tdPos: 4,
    style: css`
      font-feature-settings: 'tnum';
      font-weight: 400;
    `
  },
  {
    tdPos: 5,
    style: css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `
  }
]

export default BlockSection
