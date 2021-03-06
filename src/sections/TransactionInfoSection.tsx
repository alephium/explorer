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
import { GlobalContext } from '..'
import SectionTitle from '../components/SectionTitle'
import { Transaction } from '../types/api'
import { APIResp } from '../utils/client'
import Badge from '../components/Badge'
import { Table, TableBody, HighlightedCell } from '../components/Table'
import { AddressLink, TightLink } from '../components/Links'
import Section from '../components/Section'
import LoadingSpinner from '../components/LoadingSpinner'
import InlineErrorMessage from '../components/InlineErrorMessage'
import JSBI from 'jsbi'
import Amount from '../components/Amount'

interface ParamTypes {
  id: string
}

const TransactionInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const client = useContext(GlobalContext).client
  const [txInfo, setTxInfo] = useState<APIResp<Transaction>>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!client) return
    setLoading(true)

    client
      .transaction(id)
      .catch((e) => {
        console.log(e)
        setLoading(false)
      })
      .then((r) => {
        if (!r) return

        setTxInfo(r)
        setLoading(false)
      })
  }, [client, id])

  return (
    <Section>
      <SectionTitle title="Transaction" />
      {!loading ? (
        <>
          {txInfo && txInfo.status === 200 && txInfo.data ? (
            <Table bodyOnly>
              <TableBody>
                <tr>
                  <td>Hash</td>
                  <HighlightedCell>{txInfo.data.hash}</HighlightedCell>
                </tr>
                <tr>
                  <td>Block Hash</td>
                  <td>
                    <TightLink
                      to={`../blocks/${txInfo.data.blockHash || ''}`}
                      text={txInfo.data.blockHash || ''}
                      maxWidth="550px"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Timestamp</td>
                  <td>{dayjs(txInfo.data.timestamp).format('YYYY/MM/DD HH:mm:ss')}</td>
                </tr>
                <tr>
                  <td>Inputs</td>
                  <td>
                    {txInfo.data.inputs && txInfo.data.inputs.length > 0
                      ? txInfo.data.inputs.map((v, i) => (
                          <AddressLink
                            address={v.address}
                            txHashRef={v.txHashRef}
                            key={i}
                            amount={JSBI.BigInt(v.amount)}
                          />
                        ))
                      : 'Block Rewards'}
                  </td>
                </tr>
                <tr>
                  <td>Outputs</td>
                  <td>
                    {txInfo.data.outputs.map((v, i) => (
                      <AddressLink address={v.address} key={i} amount={JSBI.BigInt(v.amount)} txHashRef={v.spent} />
                    ))}
                  </td>
                </tr>
                <tr>
                  <td>Start Gas</td>
                  <td>
                    <Amount value={JSBI.BigInt(txInfo.data.startGas)} />
                  </td>
                </tr>
                <tr>
                  <td>Gas Price</td>
                  <td>
                    <Amount value={JSBI.BigInt(txInfo.data.gasPrice)} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Total value</b>
                  </td>
                  <td>
                    <Badge
                      type={'neutral'}
                      content={txInfo.data.outputs.reduce<JSBI>(
                        (acc, o) => JSBI.add(acc, JSBI.BigInt(o.amount)),
                        JSBI.BigInt(0)
                      )}
                      amount
                    />
                  </td>
                </tr>
              </TableBody>
            </Table>
          ) : (
            <InlineErrorMessage message={txInfo?.detail} code={txInfo?.status} />
          )}
        </>
      ) : (
        <LoadingSpinner />
      )}
    </Section>
  )
}

export default TransactionInfoSection
