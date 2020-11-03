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
import React, { FC, useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { APIContext } from '..'
import PageTitle, { SecondaryTitle } from '../components/PageTitle'
import { Table, TableHeader, TDStyle, TableBody, HighlightedCell, AnimatedCell, DetailsRow, Row, DetailToggle } from '../components/Table'
import { Block, Transaction } from '../types/api'
import transactionIcon from '../images/transaction-icon.svg'
import { AddressLink, TightLink } from '../components/Links'
import { ArrowRight } from 'react-feather'
import Badge from '../components/Badge'
import { APIError } from '../utils/client'
import Amount from '../components/Amount'
import Section from '../components/Section'

interface ParamTypes {
  id: string
}

const BlockInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const [blockInfo, setBlockInfo] = useState<Block & APIError>()
  const client = useContext(APIContext).client

  useEffect(() => {
    (async () => {
      setBlockInfo(await client.block(id))
    })()
  }, [id, client])

  return (
    <Section>
      {!blockInfo?.status ? <>
      <PageTitle title="Block" />
      <Table bodyOnly>
        <TableBody tdStyles={BlockTableBodyCustomStyles}>
          <tr><td>Hash</td><HighlightedCell>{blockInfo?.hash}</HighlightedCell></tr>
          <tr><td>Height</td><td>{blockInfo?.height}</td></tr>
          <tr><td>Chain Index</td><td>{blockInfo?.chainFrom} → {blockInfo?.chainTo}</td></tr>
          <tr><td>Nb. of transactions</td><td>{blockInfo?.transactions.length}</td></tr>
          <tr><td>Timestamp</td><td>{dayjs(blockInfo?.timestamp).format('YYYY/MM/DD HH:mm:ss')}</td></tr>
        </TableBody>
      </Table>
      
      <SecondaryTitle>Transactions</SecondaryTitle>
      <Table hasDetails>
        <TableHeader headerTitles={[ '', 'Hash', 'Inputs', '', 'Outputs', 'Amount', '' ]} columnWidths={ ['50px', '', '15%', '50px', '', '130px', '50px'] }/>
        <TableBody tdStyles={TXTableBodyCustomStyles}>
          {blockInfo?.transactions.map((t, i) => (
            <TransactionRow transaction={t} key={i} />
          ))}
        </TableBody>
      </Table>
      </> : <span>{blockInfo?.detail}</span>}
    </Section>
  )
}

interface TransactionRowProps {
  transaction: Transaction
}

const TransactionRow: FC<TransactionRowProps> = ({ transaction }) => {
  const t = transaction
  const [detailOpen, setDetailOpen] = useState(false)

  const toggleDetail = useCallback(() => setDetailOpen(!detailOpen), [detailOpen])

  return (
    <>
      <Row key={t.hash} isActive={detailOpen} >
        <td><TransactionIcon /></td>
        <td><TightLink to={`/transactions/${t.hash}`} text={t.hash} maxCharacters={16}/></td>
        <td>{t.inputs.length} address{t.inputs.length > 1 ? 'es' : ''}</td>
        <td><ArrowRight size={15} /></td>
        <td>{t.outputs.length} address{t.outputs.length > 1 ? 'es' : ''}</td>
        <td><Badge type={'neutral'} content={t.outputs.reduce<bigint>((acc, o) => (acc + BigInt(o.amount)), BigInt(0))} amount /></td>
        <td><DetailToggle isOpen={detailOpen} onClick={toggleDetail} /></td>
      </Row> 
      <DetailsRow openCondition={detailOpen}>
        <td/>
        <td/>
        <AnimatedCell>
          {t.inputs.map((input, i) => <AddressLink key={i} address={input.address} txHashRef={input.txHashRef} /> )}
        </AnimatedCell>
        <td />
        <AnimatedCell>{t.outputs.map((o, i) => <AddressLink address={o.address} key={i} />)}</AnimatedCell>
        <AnimatedCell>{t.outputs.map((o, i) => <Amount value={o.amount} key={i} />)}</AnimatedCell>
        <td />
      </DetailsRow>      
    </>
  )
}

// TODO: make expandlable elements generic (in Table.tsx)

const TransactionIcon = styled.div`
  background-image: url(${transactionIcon});
  background-position: center;
  background-repeat: no-repeat;
  height: 25px;
  width: 25px;
`

const BlockTableBodyCustomStyles: TDStyle[] = [
  { 
    tdPos: 2,
    style: css`
      font-weight: 600;
    `
  }
]

const TXTableBodyCustomStyles: TDStyle[] = [
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
      color: ${({ theme }) => theme.textAccent};
    `
  },
  { 
    tdPos: 4,
    style: css`
      text-align: center;
      color: ${({ theme }) => theme.textSecondary};
    `
  },
  { 
    tdPos: 5,
    style: css`
      color: ${({ theme }) => theme.textAccent};
    `
  }
]

export default BlockInfoSection