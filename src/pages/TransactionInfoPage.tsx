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
import _, { uniq } from 'lodash'
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
import { IOAmountsDelta } from '@/utils/transactions'

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

  const addressesInvolved = uniq([...Object.keys(alphDeltaAmounts), ...Object.keys(tokenDeltaAmounts)])

  return (
    <Section>
      <SectionTitle title="Transaction" />
      {!txInfoError ? (
        <>
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
                        {Object.keys(alphDeltaAmounts).length > 0 && (
                          <AssetLogo assetId={ALPH.id} size={20} showTooltip />
                        )}
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
              </TableBody>
            )}
          </Table>
          <TotalAmountsTable bodyOnly isLoading={txInfoLoading}>
            <TableBody>
              <TableRow>
                <b>Total Amounts</b>
                <DetltaAmountsContainer>
                  {addressesInvolved.map((addressHash) => (
                    <DeltaAmountsBox key={addressHash}>
                      <DeltaAmountsTitle>
                        <AddressLink address={addressHash} maxWidth="180px" />
                      </DeltaAmountsTitle>
                      <AmountList>
                        <Amount
                          value={BigInt(alphDeltaAmounts[addressHash])}
                          displaySign={true}
                          highlight
                          assetId={ALPH.id}
                        />
                        {Object.entries(tokenDeltaAmounts[addressHash] || []).map((t) => (
                          <Amount key={t[0]} value={BigInt(t[1])} assetId={t[0]} displaySign={true} highlight />
                        ))}
                      </AmountList>
                    </DeltaAmountsBox>
                  ))}
                </DetltaAmountsContainer>
              </TableRow>
            </TableBody>
          </TotalAmountsTable>
        </>
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

const TotalAmountsTable = styled(Table)`
  margin-top: 20px;
`

const DetltaAmountsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
`

const DeltaAmountsBox = styled.div`
  flex: 1;
  display: flex;
  max-width: 200px;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
`

const AmountList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;

  ${Amount} {
    padding: 10px;
    width: 100%;
    text-align: right;
  }

  ${Amount}:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const DeltaAmountsTitle = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 5px;
`

export default TransactionInfoPage
