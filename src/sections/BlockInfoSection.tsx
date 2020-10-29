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

import dayjs from 'dayjs'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { APIContext } from '..'
import PageTitle from '../components/PageTitle'
import { BlockInfo } from '../types/api'

interface ParamTypes {
  id: string
}

const BlockInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const [blockInfo, setBlockInfo] = useState<BlockInfo>()
  const client = useContext(APIContext).client

  useEffect(() => {
    (async () => setBlockInfo(await client.block(id)))()
  }, [id, client])

  return (
    <section>
      <PageTitle title="Block" />
      <List>
        <tbody>
          <Row><td>Hash</td><HighlightedCell>{blockInfo?.hash}</HighlightedCell></Row>
          <Row><td>Height</td><td>{blockInfo?.height}</td></Row>
          <Row><td>Chain Index</td><td>{blockInfo?.chainFrom} → {blockInfo?.chainTo}</td></Row>
          <Row><td>Nb. of transactions</td><td>{blockInfo?.transactions.length}</td></Row>
          <Row><td>Timestamp</td><td>{dayjs(blockInfo?.timestamp).format('YYYY/MM/DD HH:mm:ss')}</td></Row>
        </tbody>
      </List>
      <Subtitle>Transactions</Subtitle>
    </section>
  )
}


const List = styled.table`
  width: 100%;
  border-collapse: collapse; 
`

const Row = styled.tr`
  height: 50px;
  border-bottom: 2px solid ${({ theme }) => theme.borderPrimary};

  td:nth-child(1) {
    width: 30%;
  }

  td:nth-child(2) {
    font-weight: 500;
  }
`

const HighlightedCell = styled.td`
  font-weight: bold;
  color: ${({ theme }) => theme.textAccent };
`

const Subtitle = styled.h2`
  margin-top: 40px;
`

export default BlockInfoSection