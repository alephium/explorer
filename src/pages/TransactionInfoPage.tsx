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
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { PerChainHeight, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import _ from 'lodash'
import { Check } from 'lucide-react'
import { useRef } from 'react'
import { usePageVisibility } from 'react-page-visibility'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { queries } from '@/api'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Badge from '@/components/Badge'
import InlineErrorMessage from '@/components/InlineErrorMessage'
import { SimpleLink } from '@/components/Links'
import LoadingSpinner from '@/components/LoadingSpinner'
import Section from '@/components/Section'
import SectionTitle from '@/components/SectionTitle'
import HighlightedCell from '@/components/Table/HighlightedCell'
import Table from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import TableRow from '@/components/Table/TableRow'
import Timestamp from '@/components/Timestamp'
import TransactionIOList from '@/components/TransactionIOList'

type ParamTypes = {
  id: string
}

const TransactionInfoPage = () => {
  const { id } = useParams<ParamTypes>()
  const isAppVisible = usePageVisibility()

  const previousTransactionData = useRef<Transaction | undefined>()

  const {
    data: transactionData,
    error: transactionInfoError,
    isLoading: txInfoLoading
  } = useQuery({
    ...queries.transactions.transaction.one(id || ''),
    enabled: !!id,
    refetchInterval:
      isAppVisible && (!previousTransactionData.current || !isTxConfirmed(previousTransactionData.current))
        ? 10000
        : undefined
  })

  let txInfoError, txInfoErrorStatus

  if (transactionInfoError) {
    const e = transactionInfoError as APIError
    txInfoError = e.error
    txInfoErrorStatus = e.status
  }

  const txInfo = transactionData as Transaction

  previousTransactionData.current = txInfo

  const { data: txBlock } = useQuery({ ...queries.blocks.block.one(txInfo?.blockHash), enabled: isTxConfirmed(txInfo) })

  const { data: chainHeights } = useQuery(queries.infos.all.heights())

  const assetIds = _(txInfo?.inputs?.flatMap((i) => i.tokens?.map((t) => t.id)))
    .uniq()
    .compact()
    .value()

  const txChain = chainHeights?.find(
    (c: PerChainHeight) => c.chainFrom === txBlock?.chainFrom && c.chainTo === txBlock.chainTo
  )

  const confirmations = computeConfirmations(txBlock, txChain)

  // https://github.com/microsoft/TypeScript/issues/33591
  const outputs: Array<explorer.Output> | undefined = txInfo?.outputs

  const totalAmount = outputs?.reduce<bigint>(
    (acc, o) => acc + BigInt((o as explorer.Output).attoAlphAmount ?? (o as explorer.AssetOutput).attoAlphAmount),
    BigInt(0)
  )

  return (
    <Section>
      <SectionTitle title="Transaction" />
      {!txInfoError ? (
        <Table bodyOnly isLoading={txInfoLoading}>
          {txInfo && (
            <TableBody>
              <TableRow>
                <span>Hash</span>
                <HighlightedCell textToCopy={txInfo.hash}>{txInfo.hash}</HighlightedCell>
              </TableRow>
              <TableRow>
                <span>Status</span>
                {isTxConfirmed(txInfo) ? (
                  txInfo.scriptExecutionOk ? (
                    <Badge
                      type="plus"
                      content={
                        <span>
                          <Check style={{ marginRight: 5 }} size={15} />
                          Success
                        </span>
                      }
                      inline
                    />
                  ) : (
                    <Badge type="minus" content={<span>Script execution failed</span>} />
                  )
                ) : (
                  <Badge
                    type="neutral"
                    content={
                      <>
                        <LoadingSpinner style={{ marginRight: 5 }} size={15} />
                        <span>Pending</span>
                      </>
                    }
                  />
                )}
              </TableRow>
              {isTxConfirmed(txInfo) && txInfo.blockHash && txBlock && (
                <TableRow>
                  <span>Block</span>
                  <span>
                    <SimpleLink
                      to={`../blocks/${txInfo.blockHash || ''}`}
                      data-tip={`On chain ${txChain?.chainFrom} → ${txChain?.chainTo}`}
                    >
                      {txBlock?.height.toString()}
                    </SimpleLink>
                    <span data-tip="Number of blocks mined since" style={{ marginLeft: 10 }}>
                      <Badge
                        type="neutral"
                        content={
                          <span>
                            {confirmations} {confirmations === 1 ? 'Confirmation' : 'Confirmations'}
                          </span>
                        }
                        inline
                      />
                    </span>
                  </span>
                </TableRow>
              )}
              {isTxConfirmed(txInfo) && txInfo.timestamp && (
                <TableRow>
                  <span>Timestamp</span>
                  <Timestamp timeInMs={txInfo.timestamp} forceFormat="high" />
                </TableRow>
              )}
              {isTxConfirmed(txInfo) && (
                <TableRow>
                  <span>Assets</span>
                  <AssetLogos>
                    <>
                      {totalAmount && <AssetLogo assetId={ALPH.id} size={20} showTooltip />}
                      {assetIds.map((id) => (
                        <AssetLogo key={id} assetId={id} size={20} showTooltip />
                      ))}
                    </>
                  </AssetLogos>
                </TableRow>
              )}
              {isTxConfirmed(txInfo) && (
                <TableRow>
                  <span>Inputs</span>
                  <div>
                    {txInfo.inputs && txInfo.inputs.length > 0 ? (
                      <TransactionIOList inputs={txInfo.inputs} flex IOItemWrapper={IOItemContainer} />
                    ) : (
                      'Block Rewards'
                    )}
                  </div>
                </TableRow>
              )}
              {isTxConfirmed(txInfo) && (
                <TableRow>
                  <span>Outputs</span>
                  <div>
                    {txInfo.outputs ? (
                      <TransactionIOList outputs={txInfo.outputs} flex IOItemWrapper={IOItemContainer} />
                    ) : (
                      '-'
                    )}
                  </div>
                </TableRow>
              )}
              <TableRow>
                <span>Gas Amount</span>
                <span>{txInfo.gasAmount || '-'} GAS</span>
              </TableRow>
              <TableRow>
                <span>Gas Price</span>

                <Amount assetId={ALPH.id} value={BigInt(txInfo.gasPrice)} fullPrecision />
              </TableRow>
              <TableRow>
                <span>Transaction Fee</span>
                <Amount assetId={ALPH.id} value={BigInt(txInfo.gasPrice) * BigInt(txInfo.gasAmount)} fullPrecision />
              </TableRow>
              <TableRow>
                <b>Total ALPH Value</b>
                <Badge type="neutralHighlight" amount={totalAmount} />
              </TableRow>
            </TableBody>
          )}
        </Table>
      ) : (
        <InlineErrorMessage message={txInfoError.toString()} code={txInfoErrorStatus} />
      )}
    </Section>
  )
}

const isTxConfirmed = (tx?: explorer.Transaction): tx is explorer.Transaction =>
  !!tx && (tx as explorer.Transaction).blockHash !== undefined

const computeConfirmations = (txBlock?: explorer.BlockEntryLite, txChain?: explorer.PerChainHeight): number => {
  let confirmations = 0

  if (txBlock && txChain) {
    const chainHeight = txChain.value
    confirmations = chainHeight - txBlock.height + 1
  }

  return confirmations
}

const IOItemContainer = styled.div`
  padding: 5px 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const AssetLogos = styled.div`
  display: flex;
  gap: 10px;
`

export default TransactionInfoPage
