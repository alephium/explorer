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

import { BlockEntryLite, Transaction } from '@alephium/sdk/api/explorer'
import { ArrowRight } from 'lucide-react'
import { FC, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import Amount from '../components/Amount'
import Badge from '../components/Badge'
import InlineErrorMessage from '../components/InlineErrorMessage'
import { AddressLink, TightLink } from '../components/Links'
import PageSwitch from '../components/PageSwitch'
import Section from '../components/Section'
import SectionTitle, { SecondaryTitle } from '../components/SectionTitle'
import HighlightedCell from '../components/Table/HighlightedCell'
import Table, { TDStyle } from '../components/Table/Table'
import TableBody from '../components/Table/TableBody'
import { AnimatedCell, DetailToggle, TableDetailsRow } from '../components/Table/TableDetailsRow'
import TableHeader from '../components/Table/TableHeader'
import TableRow from '../components/Table/TableRow'
import Timestamp from '../components/Timestamp'
import { useGlobalContext } from '../contexts/global'
import usePageNumber from '../hooks/usePageNumber'
import useTableDetailsState from '../hooks/useTableDetailsState'
import transactionIcon from '../images/transaction-icon.svg'
import { APIError } from '../utils/api'

interface ParamTypes {
  id: string
}

const BlockInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const { client } = useGlobalContext()
  const history = useHistory()

  const [blockInfo, setBlockInfo] = useState<BlockEntryLite>()
  const [blockInfoError, setBlockInfoError] = useState('')
  const [blockInfoStatus, setBlockInfoStatus] = useState<number>()
  const [txList, setTxList] = useState<Transaction[]>()
  const [txListStatus, setTxListStatus] = useState<number>()

  const [infoLoading, setInfoLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)

  const currentPageNumber = usePageNumber()

  // Block info
  useEffect(() => {
    const fetchBlockInfo = async () => {
      if (!client) return
      setInfoLoading(true)
      try {
        const { data, status } = await client.blocks.getBlocksBlockHash(id)
        if (data) setBlockInfo(data)
        setBlockInfoStatus(status)
      } catch (e) {
        console.error(e)
        const { error } = e as APIError
        setBlockInfoError(error.detail)
        setBlockInfoStatus(error.status)
      }
      setInfoLoading(false)
    }

    fetchBlockInfo()
  }, [client, id])

  // Block transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!client) return
      setTxLoading(true)
      try {
        const { data, status } = await client.blocks.getBlocksBlockHashTransactions(id, {
          page: currentPageNumber
        })
        if (data) setTxList(data)
        setTxListStatus(status)
      } catch (e) {
        console.error(e)
        const { error } = e as APIError
        setTxListStatus(error.status)
      }
      setTxLoading(false)
    }

    fetchTransactions()
  }, [id, currentPageNumber, client])

  // If user entered an incorrect url (or did an incorrect search, try to see if a transaction exists with this hash)
  useEffect(() => {
    if (!client || !blockInfoError) return

    const redirectToTransactionIfExists = async () => {
      try {
        const { data } = await client.transactions.getTransactionsTransactionHash(id)
        if (data) history.push(`/transactions/${id}`)
      } catch (error) {
        console.error(error)
      }
    }

    redirectToTransactionIfExists()
  }, [blockInfo, id, history, client, blockInfoError])

  return !infoLoading && (!blockInfo || blockInfoStatus !== 200) ? (
    <InlineErrorMessage message={blockInfoError} code={blockInfoStatus} />
  ) : (
    <Section>
      <SectionTitle title="Block" isLoading={infoLoading || txLoading} />

      <Table bodyOnly isLoading={infoLoading}>
        {blockInfo && (
          <TableBody tdStyles={BlockTableBodyCustomStyles}>
            <TableRow>
              <td>Hash</td>
              <HighlightedCell textToCopy={blockInfo.hash}>{blockInfo.hash}</HighlightedCell>
            </TableRow>
            <TableRow>
              <td>Height</td>
              <td>{blockInfo.height}</td>
            </TableRow>
            <TableRow>
              <td>Chain Index</td>
              <td>
                {blockInfo.chainFrom} → {blockInfo.chainTo}
              </td>
            </TableRow>
            <TableRow>
              <td>Nb. of transactions</td>
              <td>{blockInfo.txNumber}</td>
            </TableRow>
            <TableRow>
              <td>Timestamp</td>
              <td>
                <Timestamp timeInMs={blockInfo.timestamp} forceHighPrecision />
              </td>
            </TableRow>
          </TableBody>
        )}
      </Table>

      {blockInfo?.mainChain ? (
        !txLoading && (!txList || txListStatus !== 200) ? (
          <InlineErrorMessage message="An error occured while fetching transactions" code={txListStatus} />
        ) : (
          <>
            <SecondaryTitle>Transactions</SecondaryTitle>
            <Table main hasDetails scrollable isLoading={txLoading}>
              {txList && txList && (
                <>
                  <TableHeader
                    headerTitles={['', 'Hash', 'Inputs', '', 'Outputs', 'Total Amount', '']}
                    columnWidths={['35px', '150px', '120px', '50px', '120px', '90px', '30px']}
                    textAlign={['left', 'left', 'left', 'left', 'left', 'right', 'left']}
                  />
                  <TableBody tdStyles={TXTableBodyCustomStyles}>
                    {txList.map((t, i) => (
                      <TransactionRow transaction={t} key={i} />
                    ))}
                  </TableBody>
                </>
              )}
            </Table>
          </>
        )
      ) : (
        !txLoading && (
          <>
            <SecondaryTitle>Orphan block</SecondaryTitle>
            <div>It appears that this block is not part of the main chain.</div>
          </>
        )
      )}

      {txList && blockInfo?.txNumber !== undefined && blockInfo.txNumber > 0 && (
        <PageSwitch totalNumberOfElements={blockInfo.txNumber} />
      )}
    </Section>
  )
}

interface TransactionRowProps {
  transaction: Transaction
}

const TransactionRow: FC<TransactionRowProps> = ({ transaction }) => {
  const t = transaction
  const { detailOpen, toggleDetail } = useTableDetailsState(false)

  return (
    <>
      <TableRow key={t.hash} isActive={detailOpen} onClick={toggleDetail}>
        <td>
          <TransactionIcon />
        </td>
        <td>
          <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="150px" />
        </td>
        <td>
          {t.inputs ? t.inputs.length : 0} {t.inputs && t.inputs.length === 1 ? 'address' : 'addresses'}
        </td>
        <td>
          <ArrowRight size={15} />
        </td>
        <td>
          {t.outputs ? t.outputs.length : 0} {t.outputs && t.outputs.length === 1 ? 'address' : 'addresses'}
        </td>
        <td>
          <Badge
            type={'neutral'}
            amount={t.outputs && t.outputs.reduce<bigint>((acc, o) => acc + BigInt(o.amount), BigInt(0))}
            floatRight
          />
        </td>
        <DetailToggle isOpen={detailOpen} onClick={toggleDetail} />
      </TableRow>
      <TableDetailsRow openCondition={detailOpen}>
        <td />
        <td />
        <AnimatedCell>
          {t.inputs &&
            t.inputs.map((input, i) => (
              <AddressLink key={i} address={input.address} txHashRef={input.txHashRef} maxWidth="180px" />
            ))}
        </AnimatedCell>
        <td />
        <AnimatedCell>
          {t.outputs && t.outputs.map((o, i) => <AddressLink address={o.address} key={i} maxWidth="180px" />)}
        </AnimatedCell>
        <AnimatedCell alignItems="right">
          {t.outputs && t.outputs.map((o, i) => <Amount value={BigInt(o.amount)} key={i} />)}
        </AnimatedCell>
        <td />
      </TableDetailsRow>
    </>
  )
}

// TODO: make expandlable elements generic (in Table.tsx)

const TransactionIcon = styled.div`
  background-image: url(${transactionIcon});
  background-position: center;
  background-repeat: no-repeat;
  height: 20px;
  width: 20px;
`

const BlockTableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 2,
    style: css`
      font-weight: 500;
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
