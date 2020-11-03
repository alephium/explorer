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

import React, { FC, useCallback, useContext, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useParams } from 'react-router-dom'
import { APIContext } from '..'
import PageTitle, { SecondaryTitle } from '../components/PageTitle'
import { Address, Transaction } from '../types/api'
import { APIError } from '../utils/client'
import Badge from '../components/Badge'
import { Table, TableBody, HighlightedCell, TableHeader, AnimatedCell, DetailsRow, Row, DetailToggle, TDStyle } from '../components/Table'
import { AddressLink, TightLink } from '../components/Links'
import { css } from 'styled-components'
import { ArrowRight } from 'react-feather'
import Section from '../components/Section'

dayjs.extend(relativeTime)

interface ParamTypes {
  id: string
}

const TransactionInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const client = useContext(APIContext).client
  const [addressInfo, setAddressInfo] = useState<Address & APIError>()

  useEffect(() => {
    (async () =>
    setAddressInfo(await client.address(id))
    )()
  }, [client, id])

  return (
    <Section>
      {!addressInfo?.status ? <>
      <PageTitle title="Address" />
      <Table>
        <TableBody>
          <tr><td>Address</td><HighlightedCell>{id}</HighlightedCell></tr>
          <tr><td>Balance</td><td><Badge type={'neutralHighlight'} content={addressInfo?.balance} amount /></td></tr>
        </TableBody>
      </Table>
      
      <SecondaryTitle>History</SecondaryTitle>
      <Table hasDetails>
        <TableHeader headerTitles={[ 'Hash', 'Timestamp', 'Account(s)', 'Amount' ]} />
        <TableBody tdStyles={AdressTxTableBodyCustomStyles}>
          {addressInfo?.transactions.sort((t1, t2) => t2.timestamp - t1.timestamp).map((t, i) => (
            <AddressTransactionRow transaction={t} key={i} />
          ))}
        </TableBody>
      </Table>

      </> : <span>{addressInfo?.detail}</span>}
    </Section>
  )
}

interface AddressTransactionRowProps {
  transaction: Transaction
}

const AddressTransactionRow: FC<AddressTransactionRowProps> = ({ transaction }) => {
  const { id } = useParams<ParamTypes>()

  const t = transaction
  const [detailOpen, setDetailOpen] = useState(false)

  const toggleDetail = useCallback(() => setDetailOpen(!detailOpen), [detailOpen])

  const isOut = t.inputs.findIndex(i => i.address === id) !== -1

  const renderOutputAccounts = () => {
    return t.outputs.filter(o => o.address !== id).map((output, i) => <AddressLink key={i} address={output.address} />)
  }

  const renderInputAccounts = () => {
    return t.inputs.filter(o => o.address !== id).map((input, i) => <AddressLink key={i} address={input.address} />)
  }

  return (
    <>
      <Row key={t.hash} isActive={detailOpen} >
        <td><TightLink to={`/transactions/${t.hash}`} text={t.hash} maxCharacters={8}/></td>
        <td>{dayjs().to(t.timestamp)}</td>
        <td>{isOut ? renderOutputAccounts() : renderInputAccounts()}</td>
        <td><Badge type={isOut ? 'minus' : 'plus'} amount prefix={isOut ? '- ' : '+ '} content={t.outputs.reduce<bigint>((acc, o) => (acc + BigInt(o.amount)), BigInt(0)).toString()}/></td>
        <td><DetailToggle isOpen={detailOpen} onClick={toggleDetail} /></td>
      </Row> 
      <DetailsRow openCondition={detailOpen}>
        <td />
        <td />
        <AnimatedCell colSpan={3}>
          <Table noBorder>
            <TableHeader headerTitles={['Inputs', '', 'Outputs']} compact transparent/>
            <TableBody>
              <Row>
                <td>{t.inputs.map((input, i) => <AddressLink key={i} address={input.address} txHashRef={input.txHashRef} amount={input.amount} /> )}</td>
                <td style={{ textAlign: 'center' }}><ArrowRight size={12}/></td>
                <td>{t.outputs.map((output, i) => <AddressLink key={i} address={output.address} amount={output.amount} /> )}</td>
              </Row>
            </TableBody>
          </Table>
        </AnimatedCell>
      </DetailsRow>      
    </>
  )
}

const AdressTxTableBodyCustomStyles: TDStyle[] = [
  { 
    tdPos: 1,
    style: css`
      width: 15%;
    `
  },
  { 
    tdPos: 2,
    style: css`
      width: 20%;
    `
  },
  { 
    tdPos: 3,
    style: css`
      width: 50%;
    `
  },
  { 
    tdPos: 4,
    style: css`
      width: 10%;
    `
  },
  { 
    tdPos: 5,
    style: css`
      width: 50px;
    `
  }
]

export default TransactionInfoSection