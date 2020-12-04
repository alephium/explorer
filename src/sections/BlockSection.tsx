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
import _ from 'lodash'
import styled, { css } from 'styled-components'
import PageTitle from '../components/PageTitle'
import { Block } from '../types/api'
import { useInterval } from '../utils/util'
import blockIcon from '../images/block-icon.svg'
import { Plus } from 'react-feather'
import relativeTime from 'dayjs/plugin/relativeTime'
import LoadingSpinner from '../components/LoadingSpinner'
import { APIContext } from '..'
import { Table, TableBody, TableHeader, TDStyle } from '../components/Table'
import { TextButton } from '../components/Buttons'
import { TightLinkStrict } from '../components/Links'
import Section from '../components/Section'
import { motion } from 'framer-motion'

dayjs.extend(relativeTime)

const BlockSection = () => {
  const [fetchTs, setFetchTs] = useState({ from: dayjs().subtract(5, 'm'), to: dayjs() })
  const [displayFromTs, setDisplayFromTs] = useState(dayjs().subtract(5, 'm'))
  const [blocks, setBlocks] = useState<Block[]>([]) // TODO: define blocks type
  const [loading, setLoading] = useState(false)

  const client = useContext(APIContext).client

  // Fetching Data
  useEffect(() => {
    const getBlocks = async () => {
      const to = fetchTs.to
      const from = fetchTs.from

      console.log('Fetching blocks: ' + from.format() + ' -> ' + to.format() + ' (' + from + ' -> ' + to + ')')

      setLoading(true)
      const fetchedBlocks: Block[] = await client.blocks(from.valueOf(), to.valueOf())
      console.log('Number of block fetched: ' + fetchedBlocks.length)

      setBlocks((prev) =>
        _.unionBy(fetchedBlocks, prev, 'hash').sort((a: Block, b: Block) => b.timestamp - a.timestamp)
      )
      setLoading(false)
    }

    getBlocks()
  }, [client, fetchTs])

  // Polling
  const fetchData = useCallback(() => {
    if (blocks.length > 0) {
      setFetchTs({ from: dayjs(blocks[0].timestamp).add(1), to: dayjs() })
    }
  }, [blocks])

  useInterval(fetchData, 5 * 1000)

  // Load more
  const loadMore = useCallback(() => {
    const previousDisplayFromTs = displayFromTs
    const newDisplayFromTs = dayjs(displayFromTs).subtract(5, 'm')
    setDisplayFromTs(newDisplayFromTs)
    setFetchTs({ from: newDisplayFromTs, to: previousDisplayFromTs })
  }, [displayFromTs])

  return (
    <Section>
      <PageTitle title="Blocks" />
      <Content>
        <Table main>
          <TableHeader
            headerTitles={['', 'Hash', 'Height', 'Txn', 'Chain index', 'Timestamp']}
            columnWidths={['50px', '25%', '16%', '12%', '20%', '']}
          />
          <TableBody tdStyles={TableBodyCustomStyles}>
            {blocks
              .filter((b) => dayjs(b.timestamp).isAfter(displayFromTs))
              .map((b) => (
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
        <LoadMore>
          {loading ? (
            <span>
              <LoadingSpinner size={12} /> Loading...
            </span>
          ) : (
            <TextButton onClick={loadMore}>
              <Plus />
              Load more...
            </TextButton>
          )}
        </LoadMore>
      </Content>
    </Section>
  )
}

const Content = styled.div`
  margin-top: 30px;
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
