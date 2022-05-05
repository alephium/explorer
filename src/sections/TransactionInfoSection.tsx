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

import { APIError } from '@alephium/sdk'
import { Output, PerChainValue, Transaction, UOutput } from '@alephium/sdk/api/explorer'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Amount from '../components/Amount'
import Badge from '../components/Badge'
import InlineErrorMessage from '../components/InlineErrorMessage'
import { AddressLink, TightLink } from '../components/Links'
import LoadingSpinner from '../components/LoadingSpinner'
import Section from '../components/Section'
import SectionTitle from '../components/SectionTitle'
import HighlightedCell from '../components/Table/HighlightedCell'
import Table from '../components/Table/Table'
import TableBody from '../components/Table/TableBody'
import TableRow from '../components/Table/TableRow'
import Timestamp from '../components/Timestamp'
import { useGlobalContext } from '../contexts/global'
import { useInterval } from '../utils/hooks'

interface ParamTypes {
  id: string
}

const TransactionInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const { client } = useGlobalContext()
  const [txInfo, setTxInfo] = useState<Transaction>()
  const [confirmations, setConfirmations] = useState<number>()
  const [txInfoStatus, setTxInfoStatus] = useState<number>()
  const [txInfoError, setTxInfoError] = useState('')
  const [loading, setLoading] = useState(true)

  const getTxInfo = useCallback(async () => {
    const fetchTransactionInfo = async () => {
      if (!client) return
      setLoading(true)
      try {
        const { data, status } = await client.transactions.getTransactionsTransactionHash(id)
        const tx = data as Transaction

        if (tx) setTxInfo(tx)

        setTxInfoStatus(status)

        if (!isTxConfirmed(tx)) return

        const { data: block } = await client.blocks.getBlocksBlockHash(tx.blockHash)
        const { data: chainHeights } = await client.infos.getInfosHeights()

        if (block && chainHeights) {
          const chain = chainHeights.find(
            (c: PerChainValue) => c.chainFrom === block.chainFrom && c.chainTo === block.chainTo
          )

          if (chain) {
            const chainHeight = chain.value
            setConfirmations(chainHeight - block.height + 1)
          }
        }
      } catch (e) {
        console.error(e)
        const { error, status } = e as APIError

        setTxInfoStatus(status)
        setTxInfoError(error.detail || error.message || 'Unknown error')
      }
      setLoading(false)
    }

    fetchTransactionInfo()
  }, [client, id])

  // Initial fetch
  useEffect(() => {
    getTxInfo()
  }, [getTxInfo])

  // Polling when TX is unconfirmed
  useInterval(() => {
    if (txInfo && !isTxConfirmed(txInfo)) getTxInfo()
  }, 15 * 1000)

  // https://github.com/microsoft/TypeScript/issues/33591
  const outputs: Array<Output | UOutput> | undefined = txInfo && txInfo.outputs && txInfo.outputs

  return (
    <Section>
      <SectionTitle title="Transaction" />
      {!loading ? (
        <>
          {txInfo && txInfoStatus === 200 && txInfo ? (
            <Table bodyOnly>
              <TableBody>
                <TableRow>
                  <td>Hash</td>
                  <HighlightedCell textToCopy={txInfo.hash}>{txInfo.hash}</HighlightedCell>
                </TableRow>
                <TableRow>
                  <td>Status</td>
                  {isTxConfirmed(txInfo) ? (
                    <td>
                      <Badge
                        type="plus"
                        content={
                          <span>
                            {confirmations ?? '0'} {confirmations === 1 ? 'Confirmation' : 'Confirmations'}
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
                </TableRow>
                {isTxConfirmed(txInfo) && txInfo.blockHash && (
                  <TableRow>
                    <td>Block Hash</td>
                    <td>
                      <TightLink
                        to={`../blocks/${txInfo.blockHash || ''}`}
                        text={txInfo.blockHash || ''}
                        maxWidth="550px"
                      />
                    </td>
                  </TableRow>
                )}
                {isTxConfirmed(txInfo) && txInfo.timestamp && (
                  <TableRow>
                    <td>Timestamp</td>
                    <td>
                      <Timestamp timeInMs={txInfo.timestamp} forceHighPrecision />
                    </td>
                  </TableRow>
                )}
                {isTxConfirmed(txInfo) && (
                  <TableRow>
                    <td>Inputs</td>
                    <td>
                      {txInfo.inputs && txInfo.inputs.length > 0
                        ? txInfo.inputs.map((v, i) => (
                            <AddressLink
                              address={v.address}
                              txHashRef={v.txHashRef}
                              key={i}
                              amount={BigInt(v.amount)}
                            />
                          ))
                        : 'Block Rewards'}
                    </td>
                  </TableRow>
                )}
                <TableRow>
                  <td>Outputs</td>
                  <td>
                    {isTxConfirmed(txInfo) &&
                      txInfo.outputs &&
                      txInfo.outputs.map((v, i) => (
                        <AddressLink address={v.address} key={i} amount={BigInt(v.amount)} txHashRef={v.spent} />
                      ))}
                  </td>
                </TableRow>
                <TableRow>
                  <td>Gas Amount</td>
                  <td>{txInfo.gasAmount || '-'} GAS</td>
                </TableRow>
                <TableRow>
                  <td>Gas Price</td>
                  <td>
                    <Amount value={BigInt(txInfo.gasPrice)} showFullPrecision />
                  </td>
                </TableRow>
                <TableRow>
                  <td>Transaction Fee</td>
                  <td>
                    <Amount value={BigInt(txInfo.gasPrice) * BigInt(txInfo.gasAmount)} showFullPrecision />
                  </td>
                </TableRow>
                <TableRow>
                  <td>
                    <b>Total Value</b>
                  </td>
                  <td>
                    <Badge
                      type="neutralHighlight"
                      amount={outputs && outputs.reduce<bigint>((acc, o) => acc + BigInt(o.amount), BigInt(0))}
                    />
                  </td>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <InlineErrorMessage message={txInfoError} code={txInfoStatus} />
          )}
        </>
      ) : (
        <LoadingSpinner />
      )}
    </Section>
  )
}

const isTxConfirmed = (tx: Transaction): tx is Transaction => {
  return (tx as Transaction).blockHash !== undefined
}

export default TransactionInfoSection
