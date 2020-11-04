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
import { APIContext } from '..'
import PageTitle from '../components/PageTitle'
import { Transaction } from '../types/api'
import { APIError } from '../utils/client'
import Badge from '../components/Badge'
import { Table, TableBody, HighlightedCell } from '../components/Table'
import { AddressLink } from '../components/Links'
import Section from '../components/Section'

interface ParamTypes {
  id: string
}

const TransactionInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const client = useContext(APIContext).client
  const [txInfo, setTxInfo] = useState<Transaction & APIError>()

  useEffect(() => {
    (async () =>
      setTxInfo(await client.transaction(id))
    )()
  }, [client, id])

  return (
    <Section>
      {!txInfo?.status ? <>
      <PageTitle title="Transaction" />
      <Table bodyOnly>
        <TableBody>
          <tr><td>Hash</td><HighlightedCell>{txInfo?.hash}</HighlightedCell></tr>
          <tr><td>Timestamp</td><td>{dayjs(txInfo?.timestamp).format('YYYY/MM/DD HH:mm:ss')}</td></tr>
          <tr><td>Inputs</td><td>{txInfo?.inputs.map((v, i) => <AddressLink address={v.address} txHashRef={v.txHashRef} key={i} amount={v.amount}/>)}</td></tr>
          <tr><td>Outputs</td><td>{txInfo?.outputs.map((v, i) => <AddressLink address={v.address} key={i} amount={v.amount} txHashRef={v.spent} /> )}</td></tr>
          <tr><td><b>Total value</b></td><td><Badge type={'neutral'} content={txInfo?.outputs.reduce<bigint>((acc, o) => (acc + BigInt(o.amount)), BigInt(0))} amount /></td></tr>
        </TableBody>
      </Table>
      </> : <span>{txInfo?.detail}</span>}
    </Section>
  )
}

export default TransactionInfoSection