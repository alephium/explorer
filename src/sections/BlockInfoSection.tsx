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

import { Transaction } from 'alephium-js/dist/api/api-explorer'
import { ArrowRight } from 'lucide-react'
import { FC, useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { GlobalContext } from '..'
import Amount from '../components/Amount'
import Badge from '../components/Badge'
import InlineErrorMessage from '../components/InlineErrorMessage'
import { AddressLink, TightLink } from '../components/Links'
import LoadingSpinner from '../components/LoadingSpinner'
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
import usePageNumber from '../hooks/usePageNumber'
import useTableDetailsState from '../hooks/useTableDetailsState'
import transactionIcon from '../images/transaction-icon.svg'
import { Block } from '../types/api'
import { APIResp } from '../utils/client'

interface ParamTypes {
  id: string
}

const BlockInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const client = useContext(GlobalContext).client
  const history = useHistory()

  const [blockInfo, setBlockInfo] = useState<APIResp<Block>>()
  const [txList, setTxList] = useState<APIResp<Transaction[]>>()

  const [infoLoading, setInfoLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)

  const currentPageNumber = usePageNumber()

  // Block info
  useEffect(() => {
    if (!client) return
    setInfoLoading(true)

    client
      .block(id)
      .catch((e) => {
        console.log(e)
        setInfoLoading(false)
      })
      .then((r) => {
        if (!r) return
        setBlockInfo(r)
        setInfoLoading(false)
      })
  }, [client, id])

  // Block transactions
  useEffect(() => {
    if (!client) return

    setTxLoading(true)

    client
      .blockTransactions(id, currentPageNumber)
      .catch((e) => {
        console.log(e)
        setTxLoading(false)
      })
      .then((r) => {
        if (!r) return
        setTxList(r)
        setTxLoading(false)
      })
  }, [client, id, currentPageNumber])

  // If user entered an incorrect url (or did an incorrect search, try to see if a transaction exists with this hash)

  useEffect(() => {
    if (!client) return
    ;(async () => {
      if (blockInfo?.detail) {
        const res = await client.transaction(id)
        if (!res?.detail) {
          // A transaction exists, redirect automatically
          history.push(`/transactions/${id}`)
        }
      }
    })()
  }, [blockInfo, id, client, history])

  return (
    <Section>
      <SectionTitle title="Block" />
      {!infoLoading ? (
        <>
          {blockInfo && blockInfo.status === 200 && blockInfo.data ? (
            <>
              <Table bodyOnly>
                <TableBody tdStyles={BlockTableBodyCustomStyles}>
                  <TableRow>
                    <td>Hash</td>
                    <HighlightedCell textToCopy={blockInfo.data.hash}>{blockInfo.data.hash}</HighlightedCell>
                  </TableRow>
                  <TableRow>
                    <td>Height</td>
                    <td>{blockInfo.data.height}</td>
                  </TableRow>
                  <TableRow>
                    <td>Chain Index</td>
                    <td>
                      {blockInfo.data.chainFrom} → {blockInfo.data.chainTo}
                    </td>
                  </TableRow>
                  <TableRow>
                    <td>Nb. of transactions</td>
                    <td>{blockInfo.data.txNumber}</td>
                  </TableRow>
                  <TableRow>
                    <td>Timestamp</td>
                    <td>
                      <Timestamp timeInMs={blockInfo.data.timestamp} forceHighPrecision />
                    </td>
                  </TableRow>
                </TableBody>
              </Table>

              {blockInfo?.data?.mainChain ? (
                <>
                  <SecondaryTitle>Transactions</SecondaryTitle>
                  {!txLoading && txList && txList.data && txList.status === 200 ? (
                    <>
                      <Table main hasDetails scrollable>
                        <TableHeader
                          headerTitles={['', 'Hash', 'Inputs', '', 'Outputs', 'Total Amount', '']}
                          columnWidths={['35px', '150px', '120px', '50px', '120px', '90px', '30px']}
                          textAlign={['left', 'left', 'left', 'left', 'left', 'right', 'left']}
                        />
                        <TableBody tdStyles={TXTableBodyCustomStyles}>
                          {txList.data.map((t, i) => (
                            <TransactionRow transaction={t} key={i} />
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  ) : (
                    <LoadingSpinner />
                  )}
                </>
              ) : (
                <>
                  <SecondaryTitle>Orphan block</SecondaryTitle>
                  <div>It appears that this block is not part of the main chain.</div>
                </>
              )}
            </>
          ) : (
            <InlineErrorMessage message={blockInfo?.detail} code={blockInfo?.status} />
          )}
          {txList && txList.data && blockInfo?.data?.txNumber !== undefined && blockInfo.data.txNumber > 0 && (
            <PageSwitch totalNumberOfElements={blockInfo.data.txNumber} />
          )}
        </>
      ) : (
        <LoadingSpinner />
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
