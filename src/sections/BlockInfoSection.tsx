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
          <Row></Row>
          <Row></Row>
        </tbody>
      </List>
    </section>
  )
}


const List = styled.table`

`

const Row = styled.tr`
  height: 60px;
`

const HighlightedCell = styled.td`
  font-weight: bold;
  color: ${({ theme }) => theme.textAccent };
`

export default BlockInfoSection