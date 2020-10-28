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

import React, { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import _ from 'lodash'
import styled from 'styled-components'
import PageTitle from '../components/PageTitle'
import RefreshTimer from '../components/RefreshTimer'
import TightLink from '../components/TightLink'
import { Block } from '../types/api'
import { ExplorerClient } from '../utils/explorer'
import { createClient, useInterval } from '../utils/util'
import blockIcon from '../images/block-icon.svg'
import { Plus } from 'react-feather'
import relativeTime from 'dayjs/plugin/relativeTime'
import LoadingSpinner from '../components/LoadingSpinner'

dayjs.extend(relativeTime)

const BlockSection = () => {
  const [fetchTs, setFetchTs] = useState({ from: dayjs().subtract(5, 'm'), to: dayjs() })
  const [displayFromMinute, setDisplayFromMinute] = useState(5)
  const [blocks, setBlocks] = useState<Block[]>([]) // TODO: define blocks type
  const [loading, setLoading] = useState(false)
  let client = useRef<ExplorerClient>()

  // Fetching Data
  useEffect(() => {
    const getBlocks = async () => {
      if (!client.current)  {
        client.current = await createClient()
      }

      const to = fetchTs.to
      const from = fetchTs.from

      console.log('Fetching blocks: ' + from.format() + ' -> ' + to.format() + ' (' + from + ' -> ' + to + ')')
      
      setLoading(true)
      const fetchedBlocks: any[] = await client.current.blocks(from.valueOf(), to.valueOf())
      console.log('Number of block fetched: ' + fetchedBlocks.length)
      
      setBlocks(prev => _.unionBy(fetchedBlocks, prev, 'hash').sort((a: Block, b: Block) => b.timestamp - a.timestamp))
      setLoading(false)
    }

    getBlocks()
  }, [fetchTs])

  // Polling
  const fetchData = () => setFetchTs(prevState => ({ from: prevState.to, to: dayjs() }))

  useInterval(fetchData, 20 * 1000, loading)

  // Load more
  const loadMore = () => setDisplayFromMinute(prev => prev + 5)

  return (
    <section>
      <PageTitle title="Blocks" surtitle="Latest" />
      <RefreshTimer lastRefreshTimestamp={fetchTs.to.valueOf()} delay={20 * 1000} isLoading={loading}/>
      <Content>
        <Table>
          <TableHeader>
            <tr>
              {['', 'Hash', 'Height', 'Chain index', 'Timestamp'].map((v) => <th key={v}>{v}</th>)}
            </tr>
          </TableHeader>
          <TableBody>
            {blocks.filter(b => dayjs(b.timestamp).isAfter(dayjs().subtract(displayFromMinute, 'm'))).map(b =>
              <tr key={b.hash}>
                <td><BlockIcon src={blockIcon} alt="Block"/></td>
                <td><TightLink to={`blocks/${b.hash}`} text={b.hash} maxCharacters={12}/></td>
                <td>{b.height}</td>
                <td>{b.chainFrom} → {b.chainTo}</td>
                <td>{dayjs().to(b.timestamp)}</td>
              </tr>
            )}
          </TableBody>
        </Table>
        {loading ? <span><LoadingSpinner size={12} /> Loading...</span> : <LoadMore onClick={loadMore}><Plus />Load more...</LoadMore>}
      </Content>
    </section>
  )
}

const Content = styled.div`
  margin-top: 30px;
`

const Table = styled.table`
  width: 100%;
  text-align: left;
  border-collapse: collapse; 
`

const TableHeader = styled.thead`
  font-weight: 400;
  color: ${({theme}) => theme.textSecondary};
  font-style: italic;

  th {
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.bgPrimary }
  }

  tr {
    height: 60px;
  }
`

const TableBody = styled.tbody`
  color: ${({theme}) => theme.textPrimary};

  tr {
    td:nth-child(3), td:nth-child(4) {
      color: ${({ theme }) => theme.textAccent};
    }

    td:nth-child(4) {
      width: 30%;
    }

    td:nth-child(5) {
      width: 20%;
    }

    border-bottom: 2px solid ${({ theme }) => theme.borderPrimary};

    td {
      padding: 10px 0;
    }
  }
`

const BlockIcon = styled.img`
  height: 25px;
  width: 25px;
`

const LoadMore = styled.a`
  display: flex;
  align-items: center;
  margin-top: 25px;

  svg {
    margin-right: 5px;
  }
`

export default BlockSection