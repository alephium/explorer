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

import React, { FC, useContext, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useParams } from 'react-router-dom'
import { APIContext } from '..'
import PageTitle, { SecondaryTitle } from '../components/PageTitle'
import { Address, Transaction } from '../types/api'
import { APIError } from '../utils/client'
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
import { css } from 'styled-components'
import _ from 'lodash'
import useTableDetailsState from '../hooks/useTableDetailsState'

dayjs.extend(relativeTime)

interface ParamTypes {
  id: string
}

const TransactionInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const client = useContext(APIContext).client
  const [addressInfo, setAddressInfo] = useState<Address & APIError>()

  useEffect(() => {
    ;(async () => setAddressInfo(await client.address(id)))()
  }, [client, id])

  return (
    <Section>
      {!addressInfo?.status ? (
        <>
          <PageTitle title="Address" />
          <Table bodyOnly>
            <TableBody tdStyles={AddressTableBodyCustomStyles}>
              <tr>
                <td>Address</td>
                <HighlightedCell>{id}</HighlightedCell>
              </tr>
              <tr>
                <td>Balance</td>
                <td>
                  <Badge type={'neutralHighlight'} content={addressInfo?.balance} amount />
                </td>
              </tr>
            </TableBody>
          </Table>

          <SecondaryTitle>History</SecondaryTitle>
          <Table hasDetails main>
            <TableHeader
              headerTitles={['Hash', 'Timestamp', '', 'Account(s)', 'Amount', '']}
              columnWidths={['10%', '15%', '80px', '30%', '130px', '40px']}
            />
            <TableBody>
              {addressInfo?.transactions
                .sort((t1, t2) => t2.timestamp - t1.timestamp)
                .map((t, i) => (
                  <AddressTransactionRow transaction={t} key={i} />
                ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <span>{addressInfo?.detail}</span>
      )}
    </Section>
  )
}

interface AddressTransactionRowProps {
  transaction: Transaction
}

const AddressTransactionRow: FC<AddressTransactionRowProps> = ({ transaction }) => {
  const { id } = useParams<ParamTypes>()

  const t = transaction
  const { detailOpen, toggleDetail } = useTableDetailsState(false)

  const amountDelta = calAmountDelta(t, id)
  const isOut = amountDelta < 0

  const renderOutputAccounts = () => {
    return _(t.outputs.filter((o) => o.address !== id))
      .map((v) => v.address)
      .uniq()
      .value()
      .map((v, i) => <AddressLink key={i} address={v} maxWidth="250px" />)
  }

  const renderInputAccounts = () => {
    return _(t.inputs.filter((o) => o.address !== id))
      .map((v) => v.address)
      .uniq()
      .value()
      .map((v, i) => <AddressLink key={i} address={v} maxWidth="250px" />)
  }

  return (
    <>
      <Row key={t.hash} isActive={detailOpen}>
        <td>
          <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="120px" />
        </td>
        <td>{dayjs().to(t.timestamp)}</td>
        <td>
          <Badge type={isOut ? 'minus' : 'plus'} content={isOut ? 'To' : 'From'} />
        </td>
        <td>{isOut ? renderOutputAccounts() : renderInputAccounts()}</td>
        <td>
          <Badge
            type={isOut ? 'minus' : 'plus'}
            amount
            prefix={isOut ? '- ' : '+ '}
            content={Math.abs(amountDelta).toString()}
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
                  {t.inputs.map((input, i) => (
                    <AddressLink
                      key={i}
                      address={input.address}
                      txHashRef={input.txHashRef}
                      amount={input.amount}
                      maxWidth="180px"
                    />
                  ))}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <ArrowRight size={12} />
                </td>
                <td>
                  {t.outputs.map((output, i) => (
                    <AddressLink key={i} address={output.address} amount={output.amount} maxWidth="180px" />
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

export default TransactionInfoSection
