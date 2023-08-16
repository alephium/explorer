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
import {
  AcceptedTransaction,
  PendingTransaction,
  PerChainHeight,
  Transaction
} from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import _, { groupBy, mapValues, reduce, uniq } from 'lodash'
import { useRef } from 'react'
import { RiCheckLine } from 'react-icons/ri'
import { usePageVisibility } from 'react-page-visibility'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { queries } from '@/api'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Badge from '@/components/Badge'
import InlineErrorMessage from '@/components/InlineErrorMessage'
import { AddressLink, SimpleLink } from '@/components/Links'
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

  const confirmedTxInfo = isTxConfirmed(transactionData) ? transactionData : undefined

  previousTransactionData.current = confirmedTxInfo

  const { data: txBlock } = useQuery({
    ...queries.blocks.block.one(confirmedTxInfo?.blockHash || ''),
    enabled: !!confirmedTxInfo
  })

  const { data: chainHeights } = useQuery(queries.infos.all.heights())

  const assetIds = _(confirmedTxInfo?.inputs?.flatMap((i) => i.tokens?.map((t) => t.id)))
    .uniq()
    .compact()
    .value()

  const txChain = chainHeights?.find(
    (c: PerChainHeight) => c.chainFrom === txBlock?.chainFrom && c.chainTo === txBlock.chainTo
  )

  const confirmations = computeConfirmations(txBlock, txChain)

  const { alph: alphDeltaAmounts, tokens: tokenDeltaAmounts } = IOAmountsDelta(
    transactionData?.inputs,
    transactionData?.outputs
  )

  const alphDeltaAmountsEntries = Object.entries(alphDeltaAmounts)
  const tokensDeltaAmountsEntries = Object.entries(tokenDeltaAmounts)

  return (
    <Section>
      <SectionTitle title="Transaction" />
      {!txInfoError ? (
        <Table bodyOnly isLoading={txInfoLoading}>
          {transactionData && (
            <TableBody>
              <TableRow>
                <span>Hash</span>
                <HighlightedCell textToCopy={transactionData.hash}>{transactionData.hash}</HighlightedCell>
              </TableRow>
              <TableRow>
                <span>Status</span>
                {confirmedTxInfo ? (
                  confirmedTxInfo.scriptExecutionOk ? (
                    <Badge
                      type="plus"
                      content={
                        <span>
                          <RiCheckLine style={{ marginRight: 5 }} size={15} />
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
              {confirmedTxInfo && confirmedTxInfo.blockHash && txBlock && (
                <TableRow>
                  <span>Block</span>
                  <span>
                    <SimpleLink
                      to={`../blocks/${confirmedTxInfo.blockHash || ''}`}
                      data-tooltip-id="default"
                      data-tooltip-content={`On chain ${txChain?.chainFrom} → ${txChain?.chainTo}`}
                    >
                      {txBlock?.height.toString()}
                    </SimpleLink>
                    <span
                      data-tooltip-id="default"
                      data-tooltip-content="Number of blocks mined since"
                      style={{ marginLeft: 10 }}
                    >
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
              {confirmedTxInfo && confirmedTxInfo.timestamp && (
                <TableRow>
                  <span>Timestamp</span>
                  <Timestamp timeInMs={confirmedTxInfo.timestamp} forceFormat="high" />
                </TableRow>
              )}
              {confirmedTxInfo && (
                <TableRow>
                  <span>Assets</span>
                  <AssetLogos>
                    <>
                      {alphDeltaAmountsEntries.length > 0 && <AssetLogo assetId={ALPH.id} size={20} showTooltip />}
                      {assetIds.map((id) => (
                        <AssetLogo key={id} assetId={id} size={20} showTooltip />
                      ))}
                    </>
                  </AssetLogos>
                </TableRow>
              )}
              {confirmedTxInfo && (
                <TableRow>
                  <span>Inputs</span>
                  <div>
                    {confirmedTxInfo.inputs && confirmedTxInfo.inputs.length > 0 ? (
                      <TransactionIOList inputs={confirmedTxInfo.inputs} flex IOItemWrapper={IOItemContainer} />
                    ) : (
                      'Block Rewards'
                    )}
                  </div>
                </TableRow>
              )}
              {confirmedTxInfo && (
                <TableRow>
                  <span>Outputs</span>
                  <div>
                    {confirmedTxInfo.outputs ? (
                      <TransactionIOList outputs={confirmedTxInfo.outputs} flex IOItemWrapper={IOItemContainer} />
                    ) : (
                      '-'
                    )}
                  </div>
                </TableRow>
              )}
              <TableRow>
                <span>Gas Amount</span>
                <span>{transactionData.gasAmount || '-'} GAS</span>
              </TableRow>
              <TableRow>
                <span>Gas Price</span>

                <Amount assetId={ALPH.id} value={BigInt(transactionData.gasPrice)} fullPrecision />
              </TableRow>
              <TableRow>
                <span>Transaction Fee</span>
                <Amount
                  assetId={ALPH.id}
                  value={BigInt(transactionData.gasPrice) * BigInt(transactionData.gasAmount)}
                  fullPrecision
                />
              </TableRow>
              <TableRow>
                <b>Total Token Amounts</b>
                <AlphValuesContainer>
                  {tokensDeltaAmountsEntries.map(([k, v]) => (
                    <AlphValue key={k}>
                      <AddressLink address={k} />
                      <TokenAmounts>
                        {Object.entries(v).map((t) => (
                          <Badge key={t[0]} type="neutral" amount={t[1]} assetId={t[0]} displayAmountSign={true} />
                        ))}
                      </TokenAmounts>
                    </AlphValue>
                  ))}
                </AlphValuesContainer>
              </TableRow>
              <TableRow>
                <b>Total ALPH Amounts</b>
                <AlphValuesContainer>
                  {alphDeltaAmountsEntries.map(([k, v]) => (
                    <AlphValue key={k}>
                      <AddressLink address={k} />
                      <Badge type="neutral" amount={v} displayAmountSign={true} />
                    </AlphValue>
                  ))}
                </AlphValuesContainer>
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

const isTxConfirmed = (tx?: Transaction | AcceptedTransaction | PendingTransaction): tx is Transaction =>
  !!tx && (tx as Transaction).blockHash !== undefined

const computeConfirmations = (txBlock?: explorer.BlockEntryLite, txChain?: explorer.PerChainHeight): number => {
  let confirmations = 0

  if (txBlock && txChain) {
    const chainHeight = txChain.value
    confirmations = chainHeight - txBlock.height + 1
  }

  return confirmations
}

// TODO: The following 2 functions could be ported to js-sdk (and properly tested there)
type AttoAlphAmount = string
type Address = string

type UTXO = {
  attoAlphAmount?: AttoAlphAmount
  address?: Address
  tokens?: { id: string; amount: string }[]
}

const sumUpAlphAmounts = (utxos: UTXO[]): Record<Address, AttoAlphAmount> => {
  const validUtxos = utxos.filter((utxo) => utxo.address && utxo.attoAlphAmount)

  const grouped = groupBy(validUtxos, 'address')
  const summed = mapValues(grouped, (addressGroup) =>
    reduce(addressGroup, (sum, utxo) => (BigInt(sum) + BigInt(utxo.attoAlphAmount || '0')).toString(), '0')
  )

  return summed
}

const sumUpTokenAmounts = (utxos: UTXO[]): Record<Address, Record<string, string>> => {
  const validUtxos = utxos.filter((utxo) => utxo.address && utxo.tokens && utxo.tokens.length > 0)

  const grouped = groupBy(validUtxos, 'address')
  const summed = mapValues(grouped, (addressGroup) => {
    const tokenSums: Record<string, string> = {}
    for (const utxo of addressGroup) {
      for (const token of utxo.tokens || []) {
        if (!tokenSums[token.id]) {
          tokenSums[token.id]
        }
        tokenSums[token.id] = (BigInt(tokenSums[token.id] || '0') + BigInt(token.amount)).toString()
      }
    }
    return tokenSums
  })

  return summed
}

const IOAmountsDelta = (
  inputs: UTXO[] = [],
  outputs: UTXO[] = []
): { alph: Record<string, string>; tokens: Record<string, Record<string, string>> } => {
  const summedInputsAlph = sumUpAlphAmounts(inputs)
  const summedOutputsAlph = sumUpAlphAmounts(outputs)
  const summedInputTokens = sumUpTokenAmounts(inputs)
  const summedOutputTokens = sumUpTokenAmounts(outputs)

  const allAddresses = uniq([...Object.keys(summedInputsAlph), ...Object.keys(summedOutputsAlph)])

  const alphDeltas: Record<string, string> = {}
  const tokenDeltas: Record<string, Record<string, string>> = {}

  for (const address of allAddresses) {
    const inputAmount = BigInt(summedInputsAlph[address])
    const outputAmount = BigInt(summedOutputsAlph[address])
    const deltaAlph = outputAmount - inputAmount
    alphDeltas[address] = deltaAlph.toString()

    const inputTokens = summedInputTokens[address]
    const outputTokens = summedOutputTokens[address]

    const allTokenIds = uniq([...Object.keys(inputTokens), ...Object.keys(outputTokens)])

    if (allTokenIds.length > 0) {
      for (const tokenId of allTokenIds) {
        if (!tokenDeltas[address]) {
          tokenDeltas[address] = {}
        }
        const inputTokenAmount = BigInt(inputTokens[tokenId] || 0)
        const outputTokenAmount = BigInt(outputTokens[tokenId] || 0)
        const deltaToken = outputTokenAmount - inputTokenAmount
        tokenDeltas[address][tokenId] = deltaToken.toString()
      }
    }
  }

  return {
    alph: alphDeltas,
    tokens: tokenDeltas
  }
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

const AlphValuesContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const AlphValue = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;

  &:first-child {
    padding-top: 5px;
  }

  &:last-child {
    padding-bottom: 5px;
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const TokenAmounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
`

export default TransactionInfoPage
