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
import React, { FC, useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { GlobalContext } from '..'
import SectionTitle, { SecondaryTitle } from '../components/SectionTitle'
import {
  Table,
  TableHeader,
  TDStyle,
  TableBody,
  HighlightedCell,
  AnimatedCell,
  DetailsRow,
  Row,
  DetailToggle
} from '../components/Table'
import { Block, Transaction } from '../types/api'
import transactionIcon from '../images/transaction-icon.svg'
import { AddressLink, TightLink } from '../components/Links'
import { ArrowRight } from 'react-feather'
import Badge from '../components/Badge'
import { APIResp } from '../utils/client'
import Amount from '../components/Amount'
import Section from '../components/Section'
import useTableDetailsState from '../hooks/useTableDetailsState'
import LoadingSpinner from '../components/LoadingSpinner'
import InlineErrorMessage from '../components/InlineErrorMessage'
import JSBI from 'jsbi'
import PageSwitch from '../components/PageSwitch'
import usePageNumber from '../hooks/usePageNumber'

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
                  <tr>
                    <td>Hash</td>
                    <HighlightedCell>{blockInfo.data.hash}</HighlightedCell>
                  </tr>
                  <tr>
                    <td>Height</td>
                    <td>{blockInfo.data.height}</td>
                  </tr>
                  <tr>
                    <td>Chain Index</td>
                    <td>
                      {blockInfo.data.chainFrom} → {blockInfo.data.chainTo}
                    </td>
                  </tr>
                  <tr>
                    <td>Nb. of transactions</td>
                    <td>{blockInfo.data.txNumber}</td>
                  </tr>
                  <tr>
                    <td>Timestamp</td>
                    <td>{dayjs(blockInfo.data.timestamp).format('YYYY/MM/DD HH:mm:ss')}</td>
                  </tr>
                </TableBody>
              </Table>

              <SecondaryTitle>Transactions</SecondaryTitle>
              {!txLoading && txList && txList.data && txList.status === 200 ? (
                <>
                  <Table main hasDetails>
                    <TableHeader
                      headerTitles={['', 'Hash', 'Inputs', '', 'Outputs', 'Amount', '']}
                      columnWidths={['50px', '', '15%', '50px', '', '130px', '50px']}
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
            <InlineErrorMessage message={blockInfo?.detail} code={blockInfo?.status} />
          )}
          {txList && txList.data && blockInfo?.data?.txNumber && (
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
      <Row key={t.hash} isActive={detailOpen} onClick={toggleDetail}>
        <td>
          <TransactionIcon />
        </td>
        <td>
          <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="150px" />
        </td>
        <td>
          {t.inputs.length} address{t.inputs.length > 1 ? 'es' : ''}
        </td>
        <td>
          <ArrowRight size={15} />
        </td>
        <td>
          {t.outputs.length} address{t.outputs.length > 1 ? 'es' : ''}
        </td>
        <td>
          <Badge
            type={'neutral'}
            content={t.outputs.reduce<JSBI>((acc, o) => JSBI.add(acc, JSBI.BigInt(o.amount)), JSBI.BigInt(0))}
            amount
          />
        </td>
        <DetailToggle isOpen={detailOpen} onClick={toggleDetail} />
      </Row>
      <DetailsRow openCondition={detailOpen}>
        <td />
        <td />
        <AnimatedCell>
          {t.inputs.map((input, i) => (
            <AddressLink key={i} address={input.address} txHashRef={input.txHashRef} />
          ))}
        </AnimatedCell>
        <td />
        <AnimatedCell>
          {t.outputs.map((o, i) => (
            <AddressLink address={o.address} key={i} />
          ))}
        </AnimatedCell>
        <AnimatedCell>
          {t.outputs.map((o, i) => (
            <Amount value={JSBI.BigInt(o.amount)} key={i} />
          ))}
        </AnimatedCell>
        <td />
      </DetailsRow>
    </>
  )
}

// TODO: make expandlable elements generic (in Table.tsx)

const TransactionIcon = styled.div`
  background-image: url(${transactionIcon});
  background-position: center;
  background-repeat: no-repeat;
  height: 25px;
  width: 25px;
`

const BlockTableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 2,
    style: css`
      font-weight: 600;
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
