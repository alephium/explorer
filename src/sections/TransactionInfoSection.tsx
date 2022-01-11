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

import { TransactionLike, Transaction, Output, UOutput } from 'alephium-js/dist/api/api-explorer'
import dayjs from 'dayjs'
import { Check } from 'lucide-react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { GlobalContext } from '..'
import Amount from '../components/Amount'
import Badge from '../components/Badge'
import InlineErrorMessage from '../components/InlineErrorMessage'
import { AddressLink, TightLink } from '../components/Links'
import LoadingSpinner from '../components/LoadingSpinner'
import Section from '../components/Section'
import SectionTitle from '../components/SectionTitle'
import { HighlightedCell, Table, TableBody } from '../components/Table'
import { APIResp } from '../utils/client'
import { useInterval } from '../utils/hooks'

interface ParamTypes {
  id: string
}

const TransactionInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const client = useContext(GlobalContext).explorerClient
  const [txInfo, setTxInfo] = useState<APIResp<TransactionLike>>()
  const [loading, setLoading] = useState(true)

  const getTxInfo = useCallback(async () => {
    if (!client) return
    setLoading(true)

    client.transactions
      .getTransactionsTransactionHash(id)
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

  // Initial fetch
  useEffect(() => {
    getTxInfo()
  }, [getTxInfo])

  // Polling when TX is unconfirmed
  useInterval(() => {
    if (txInfo && txInfo.data && !isTxConfirmed(txInfo.data)) getTxInfo()
  }, 15 * 1000)

  // https://github.com/microsoft/TypeScript/issues/33591
  const outputs: Array<Output | UOutput> | undefined =
    txInfo && txInfo.data && txInfo.data.outputs && txInfo.data.outputs

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
                  <HighlightedCell textToCopy={txInfo.data.hash}>{txInfo.data.hash}</HighlightedCell>
                </tr>
                <tr>
                  <td>Status</td>
                  {isTxConfirmed(txInfo.data) ? (
                    <td>
                      <Badge
                        type="plus"
                        content={
                          <span>
                            <Check style={{ marginRight: 5 }} size={15} />
                            Confirmed
                          </span>
                        }
                      />
                    </td>
                  ) : (
                    <td>
                      <Badge
                        type="neutral"
                        content={
                          <>
                            <LoadingSpinner style={{ marginRight: 5 }} size={15} />
                            <span>Unconfirmed</span>
                          </>
                        }
                      />
                    </td>
                  )}
                </tr>
                {isTxConfirmed(txInfo.data) && txInfo.data.blockHash && (
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
                )}
                {isTxConfirmed(txInfo.data) && txInfo.data.timestamp && (
                  <tr>
                    <td>Timestamp</td>
                    <td>{dayjs(txInfo.data.timestamp).format('MM/DD/YYYY HH:mm:ss')}</td>
                  </tr>
                )}
                {isTxConfirmed(txInfo.data) && (
                  <tr>
                    <td>Inputs</td>
                    <td>
                      {txInfo.data.inputs && txInfo.data.inputs.length > 0
                        ? txInfo.data.inputs.map((v, i) => (
                            <AddressLink
                              address={v.address}
                              txHashRef={v.txHashRef}
                              key={i}
                              amount={BigInt(v.amount)}
                            />
                          ))
                        : 'Block Rewards'}
                    </td>
                  </tr>
                )}
                <tr>
                  <td>Outputs</td>
                  <td>
                    {isTxConfirmed(txInfo.data) &&
                      txInfo.data.outputs &&
                      txInfo.data.outputs.map((v, i) => (
                        <AddressLink address={v.address} key={i} amount={BigInt(v.amount)} txHashRef={v.spent} />
                      ))}
                  </td>
                </tr>
                <tr>
                  <td>Gas Amount</td>
                  <td>{txInfo.data.gasAmount || '-'} GAS</td>
                </tr>
                <tr>
                  <td>Gas Price</td>
                  <td>
                    <Amount value={BigInt(txInfo.data.gasPrice)} />
                  </td>
                </tr>
                <tr>
                  <td>Transaction Fee</td>
                  <td>
                    <Amount value={BigInt(txInfo.data.gasPrice) * BigInt(txInfo.data.gasAmount)} showFullPrecision />
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Total value</b>
                  </td>
                  <td>
                    <Badge
                      type="neutralHighlight"
                      amount={outputs && outputs.reduce<bigint>((acc, o) => acc + BigInt(o.amount), BigInt(0))}
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

const isTxConfirmed = (tx: TransactionLike): tx is Transaction => true

export default TransactionInfoSection
