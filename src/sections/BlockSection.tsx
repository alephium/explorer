// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import React, { useCallback, useContext, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import styled, { css } from 'styled-components'
import SectionTitle from '../components/SectionTitle'
import { Block } from '../types/api'
import { useInterval } from '../utils/util'
import blockIcon from '../images/block-icon.svg'
import relativeTime from 'dayjs/plugin/relativeTime'
import LoadingSpinner from '../components/LoadingSpinner'
import { GlobalContext } from '..'
import { Table, TableBody, TableHeader, TDStyle } from '../components/Table'
import { TightLinkStrict } from '../components/Links'
import Section from '../components/Section'
import { motion } from 'framer-motion'
import { APIResp } from '../utils/client'
import PageSwitch from '../components/PageSwitch'
import usePageNumber from '../hooks/usePageNumber'

dayjs.extend(relativeTime)

const BlockSection = () => {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)

  const client = useContext(GlobalContext).client

  // Default page
  const currentPageNumber = usePageNumber()

  const getBlocks = useCallback(
    async (pageNumber: number, manualFetch?: boolean) => {
      if (!client) return

      console.log('Fetching blocks...')

      manualFetch ? setManualLoading(true) : setLoading(true)
      const fetchedBlocks: APIResp<Block[]> = await client.blocks(pageNumber)

      // Check if manual fetching has been set in the meantime (overridign polling fetch)

      if (currentPageNumber !== pageNumber) {
        setLoading(false)
        return
      }

      console.log('Number of block fetched: ' + fetchedBlocks.data?.length)
      setBlocks(fetchedBlocks.data || [])

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
    if (!loading && !manualLoading) getBlocks(currentPageNumber)
  }, 10 * 1000)

  return (
    <Section>
      <TitleAndLoader>
        <SectionTitle title="Blocks" />
        {loading && !manualLoading && (
          <PollingLoadingSpinner>
            <LoadingSpinner size={12} /> Loading...
          </PollingLoadingSpinner>
        )}
      </TitleAndLoader>
      {!manualLoading ? (
        <Content>
          <Table main>
            <TableHeader
              headerTitles={['', 'Hash', 'Height', 'Txn', 'Chain index', 'Timestamp']}
              columnWidths={['50px', '25%', '16%', '12%', '20%', '']}
            />
            <TableBody tdStyles={TableBodyCustomStyles}>
              {blocks.map((b) => (
                <motion.tr
                  key={b.hash}
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <td>
                    <BlockIcon src={blockIcon} alt="Block" />
                  </td>
                  <td>
                    <TightLinkStrict to={`blocks/${b.hash}`} text={b.hash} maxWidth="150px" />
                  </td>
                  <td>{b.height}</td>
                  <td>{b.txNumber}</td>
                  <td>
                    {b.chainFrom} → {b.chainTo}
                  </td>
                  <td>{dayjs().to(b.timestamp)}</td>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          <PageSwitch />
        </Content>
      ) : (
        <LoadingSpinner />
      )}
    </Section>
  )
}

const TitleAndLoader = styled.div`
  position: relative;
`

const Content = styled.div`
  margin-top: 30px;
`

const PollingLoadingSpinner = styled.div`
  position: absolute;
  bottom: -25px;
  color: ${({ theme }) => theme.textSecondary};
`

const TableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 1,
    style: css`
      text-align: center;
      text-align: -webkit-center;
    `
  },
  {
    tdPos: 3,
    style: css`
      font-family: 'Roboto Mono', monospace;
      color: ${({ theme }) => theme.textAccent};
      font-weight: 400;
      font-size: 95%;
    `
  },
  {
    tdPos: 4,
    style: css`
      font-family: 'Roboto Mono', monospace;
      font-weight: 400;
      font-size: 95%;
    `
  },
  {
    tdPos: 5,
    style: css`
      font-family: 'Roboto Mono', monospace;
      font-weight: 400;
      font-size: 95%;
    `
  },
  {
    tdPos: 6,
    style: css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `
  }
]

const BlockIcon = styled.img`
  height: 25px;
  width: 25px;
`

const LoadMore = styled.span`
  display: flex;
  align-items: center;
  margin-top: 25px;
  height: 20px;

  svg {
    margin-right: 5px;
  }
`

export default BlockSection
