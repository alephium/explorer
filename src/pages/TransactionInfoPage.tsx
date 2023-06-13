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

import { APIError, AssetInfo } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import _, { sortBy } from 'lodash'
import { Check } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { usePageVisibility } from 'react-page-visibility'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

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
import { useGlobalContext } from '@/contexts/global'
import useInterval from '@/hooks/useInterval'
import { getAssetListMetadata } from '@/utils/assets'

type ParamTypes = {
  id: string
}

const TransactionInfoPage = () => {
  const { id } = useParams<ParamTypes>()
  const { clients, networkType } = useGlobalContext()
  const [txInfo, setTxInfo] = useState<explorer.Transaction>()
  const [txBlock, setTxBlock] = useState<explorer.BlockEntryLite>()
  const [txChain, setTxChain] = useState<explorer.PerChainHeight>()
  const [txInfoStatus, setTxInfoStatus] = useState<number>()
  const [txInfoError, setTxInfoError] = useState('')
  const [assetsData, setAssetsData] = useState<Pick<AssetInfo, 'id'>[]>([])
  const [loading, setLoading] = useState(true)
  const isAppVisible = usePageVisibility()

  const getTxInfo = useCallback(async () => {
    const fetchTransactionInfo = async () => {
      if (!clients || !id) return

      setLoading(true)

      try {
        const data = await clients.explorer.transactions.getTransactionsTransactionHash(id)
        const tx = data as explorer.Transaction

        if (tx) setTxInfo(tx)

        if (!isTxConfirmed(tx)) return

        const block = await clients.explorer.blocks.getBlocksBlockHash(tx.blockHash)
        const chainHeights = await clients.explorer.infos.getInfosHeights()

        setTxBlock(block)

        const chain = chainHeights.find(
          (c: explorer.PerChainHeight) => c.chainFrom === block.chainFrom && c.chainTo === block.chainTo
        )

        setTxChain(chain)

        // Metadata
        const assetIds = _(tx.inputs).map('tokens').compact().flatten().map('id').uniq().value()

        const assetsMetadata = await getAssetListMetadata({ assetIds, networkType, nodeClient: clients?.node })

        setAssetsData(sortBy(assetsMetadata, [(a) => !a.verified, (a) => a.name?.toLowerCase()]))
      } catch (e) {
        console.error(e)
        const { error, status } = e as APIError

        setTxInfoStatus(status)
        setTxInfoError(error.detail || error.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionInfo()
  }, [clients, id, networkType])

  // Initial fetch
  useEffect(() => {
    getTxInfo()
  }, [getTxInfo])

  // Polling when TX is unconfirmed
  useInterval(
    () => {
      if (txInfo && !isTxConfirmed(txInfo)) getTxInfo()
    },
    15 * 1000,
    !isAppVisible
  )

  // Compute confirmations
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
        <Table bodyOnly isLoading={loading}>
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
                      {totalAmount && <AssetLogo asset={ALPH} size={20} showTooltip />}
                      {assetsData.map((a) => (
                        <AssetLogo key={a.id} asset={a} size={20} showTooltip />
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

                <Amount value={BigInt(txInfo.gasPrice)} fullPrecision />
              </TableRow>
              <TableRow>
                <span>Transaction Fee</span>
                <Amount value={BigInt(txInfo.gasPrice) * BigInt(txInfo.gasAmount)} fullPrecision />
              </TableRow>
              <TableRow>
                <b>Total ALPH Value</b>
                <Badge type="neutralHighlight" amount={totalAmount} />
              </TableRow>
            </TableBody>
          )}
        </Table>
      ) : (
        <InlineErrorMessage message={txInfoError} code={txInfoStatus} />
      )}
    </Section>
  )
}

const isTxConfirmed = (tx: explorer.Transaction): tx is explorer.Transaction =>
  (tx as explorer.Transaction).blockHash !== undefined

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
