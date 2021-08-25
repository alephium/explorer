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

import React, { FC, useContext, useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useParams } from 'react-router-dom'
import { GlobalContext } from '..'
import SectionTitle, { SecondaryTitle } from '../components/SectionTitle'
import { Address, Transaction } from '../types/api'
import { APIResp } from '../utils/client'
import { calAmountDelta } from '../utils/util'
import Badge from '../components/Badge'
import {
  Table,
  TableBody,
  HighlightedCell,
  TableHeader,
  AnimatedCell,
  DetailsRow,
  Row,
  DetailToggle,
  TDStyle
} from '../components/Table'
import { AddressLink, TightLink } from '../components/Links'
import { ArrowRight } from 'react-feather'
import Section from '../components/Section'
import styled, { css } from 'styled-components'
import _ from 'lodash'
import useTableDetailsState from '../hooks/useTableDetailsState'
import LoadingSpinner from '../components/LoadingSpinner'
import InlineErrorMessage from '../components/InlineErrorMessage'
import JSBI from 'jsbi'
import usePageNumber from '../hooks/usePageNumber'
import PageSwitch from '../components/PageSwitch'

dayjs.extend(relativeTime)

interface ParamTypes {
  id: string
}

const TransactionInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const client = useContext(GlobalContext).client
  const [addressInfo, setAddressInfo] = useState<APIResp<Address>>()
  const [txList, setTxList] = useState<APIResp<Transaction[]>>()

  const [infoLoading, setInfoLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)
  const previousId = useRef(id)

  // Default page
  const pageNumber = usePageNumber()

  // Address info
  useEffect(() => {
    if (!client) return

    previousId.current = id

    setInfoLoading(true)

    client
      .address(id)
      .catch((e) => {
        console.log(e)
        setInfoLoading(false)
      })
      .then((r) => {
        if (!r) return
        setAddressInfo(r)
        setInfoLoading(false)
      })
  }, [client, id])

  // Address transactions
  useEffect(() => {
    if (!client) return

    setTxLoading(true)

    client
      .addressTransactions(id, pageNumber)
      .catch((e) => {
        console.log(e)
        setTxLoading(false)
      })
      .then((r) => {
        if (!r) return
        setTxList(r)
        setTxLoading(false)
      })
  }, [client, id, pageNumber])

  return (
    <Section>
      <SectionTitle title="Address" />
      {!infoLoading && previousId.current === id ? (
        <>
          {addressInfo && addressInfo.status === 200 && addressInfo.data ? (
            <>
              <Table bodyOnly>
                <TableBody tdStyles={AddressTableBodyCustomStyles}>
                  <tr>
                    <td>Address</td>
                    <HighlightedCell textToCopy={id}>{id}</HighlightedCell>
                  </tr>
                  <tr>
                    <td>Balance</td>
                    <td>
                      <Badge type={'neutralHighlight'} content={addressInfo.data.balance.toString()} amount />
                    </td>
                  </tr>
                </TableBody>
              </Table>

              <SecondaryTitle>History</SecondaryTitle>
              {!txLoading && txList && txList.data && txList.status === 200 ? (
                <>
                  {txList.data.length > 0 ? (
                    <Table hasDetails main scrollable>
                      <TableHeader
                        headerTitles={['Hash', 'Timestamp', '', 'Account(s)', 'Amount', '']}
                        columnWidths={['15%', '100px', '80px', '25%', '120px', '30px']}
                        textAlign={['left', 'left', 'left', 'left', 'right', 'left']}
                      />
                      <TableBody>
                        {txList.data
                          .sort((t1, t2) => (t2.timestamp && t1.timestamp ? t2.timestamp - t1.timestamp : 1))
                          .map((t, i) => (
                            <AddressTransactionRow transaction={t} addressId={id} key={i} />
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <NoTxMessage>No transactions yet</NoTxMessage>
                  )}
                </>
              ) : (
                <LoadingSpinner />
              )}
            </>
          ) : (
            <InlineErrorMessage message={addressInfo?.detail} code={addressInfo?.status} />
          )}
          {txList && txList.data && <PageSwitch totalNumberOfElements={addressInfo?.data?.txNumber} />}
        </>
      ) : (
        <LoadingSpinner />
      )}
    </Section>
  )
}

interface AddressTransactionRowProps {
  transaction: Transaction
  addressId: string
}

const AddressTransactionRow: FC<AddressTransactionRowProps> = ({ transaction, addressId }) => {
  const t = transaction
  const { detailOpen, toggleDetail } = useTableDetailsState(false)

  const amountDelta = calAmountDelta(t, addressId)
  const isOut = JSBI.lessThan(amountDelta, JSBI.BigInt(0))

  const renderOutputAccounts = () => {
    return _(t.outputs.filter((o) => o.address !== addressId))
      .map((v) => v.address)
      .uniq()
      .value()
      .map((v, i) => <AddressLink key={i} address={v} maxWidth="250px" />)
  }

  const renderInputAccounts = () => {
    const inputAccounts = _(t.inputs.filter((o) => o.address !== addressId))
      .map((v) => v.address)
      .uniq()
      .value()
      .map((v, i) => <AddressLink key={i} address={v} maxWidth="250px" />)

    if (inputAccounts.length > 0) {
      return inputAccounts
    } else {
      return <BlockRewardLabel>Block rewards</BlockRewardLabel>
    }
  }

  return (
    <>
      <Row key={t.hash} isActive={detailOpen} onClick={toggleDetail}>
        <td>
          <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="120px" />
        </td>
        <td>{(t.timestamp && dayjs().to(t.timestamp)) || '-'}</td>
        <td>
          <Badge type={isOut ? 'minus' : 'plus'} content={isOut ? 'To' : 'From'} />
        </td>
        <td>{isOut ? renderOutputAccounts() : renderInputAccounts()}</td>
        <td>
          <Badge
            type={isOut ? 'minus' : 'plus'}
            amount
            prefix={isOut ? '- ' : '+ '}
            floatRight
            content={
              JSBI.lessThan(amountDelta, JSBI.BigInt(0))
                ? JSBI.multiply(amountDelta, JSBI.BigInt(-1)).toString()
                : amountDelta.toString()
            }
          />
        </td>
        <DetailToggle isOpen={detailOpen} onClick={toggleDetail} />
      </Row>
      <DetailsRow openCondition={detailOpen}>
        <td />
        <td />
        <AnimatedCell colSpan={4}>
          <Table noBorder>
            <TableHeader headerTitles={['Inputs', '', 'Outputs']} columnWidths={['', '50px', '']} compact transparent />
            <TableBody>
              <Row>
                <td>
                  {t.inputs.length > 0 ? (
                    t.inputs.map((input, i) => (
                      <AddressLink
                        key={i}
                        address={input.address}
                        txHashRef={input.txHashRef}
                        amount={JSBI.BigInt(input.amount)}
                        maxWidth="180px"
                      />
                    ))
                  ) : (
                    <BlockRewardLabel>Block rewards</BlockRewardLabel>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <ArrowRight size={12} />
                </td>
                <td>
                  {t.outputs.map((output, i) => (
                    <AddressLink
                      key={i}
                      address={output.address}
                      amount={JSBI.BigInt(output.amount)}
                      maxWidth="180px"
                    />
                  ))}
                </td>
              </Row>
            </TableBody>
          </Table>
        </AnimatedCell>
      </DetailsRow>
    </>
  )
}

const AddressTableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 2,
    style: css`
      font-weight: 600;
    `
  }
]

const BlockRewardLabel = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-style: italic;
`

const NoTxMessage = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`

export default TransactionInfoSection
