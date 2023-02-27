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

import { calcTxAmountsDeltaForAddress, getDirection, getHumanReadableError, isConsolidationTx } from '@alephium/sdk'
import { AddressBalance, AssetOutput, Transaction } from '@alephium/sdk/api/explorer'
import _ from 'lodash'
import { ArrowRight } from 'lucide-react'
import QRCode from 'qrcode.react'
import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import Button from '@/components/Buttons/Button'
import TimestampExpandButton from '@/components/Buttons/TimestampExpandButton'
import HighlightedHash from '@/components/HighlightedHash'
import { AddressLink, TightLink } from '@/components/Links'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageSwitch from '@/components/PageSwitch'
import Section from '@/components/Section'
import SectionTitle from '@/components/SectionTitle'
import Table, { TDStyle } from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import { AnimatedCell, DetailToggle, TableDetailsRow } from '@/components/Table/TableDetailsRow'
import TableHeader from '@/components/Table/TableHeader'
import TableRow from '@/components/Table/TableRow'
import Timestamp from '@/components/Timestamp'
import { useGlobalContext } from '@/contexts/global'
import usePageNumber from '@/hooks/usePageNumber'
import useTableDetailsState from '@/hooks/useTableDetailsState'
import { useTransactionUI } from '@/hooks/useTransactionUI'
import ExportAddressTXsModal from '@/modals/ExportAddressTXsModal'
import { blurredBackground, deviceBreakPoints } from '@/styles/globalStyles'

type ParamTypes = {
  id: string
}

const TransactionInfoPage = () => {
  const theme = useTheme()
  const { id } = useParams<ParamTypes>()
  const { client, setSnackbarMessage } = useGlobalContext()

  const [txNumber, setTxNumber] = useState<number>()
  const [totalBalance, setTotalBalance] = useState<AddressBalance>()
  const [txListError, setTxListError] = useState('')
  const [txList, setTxList] = useState<Transaction[]>()

  const [txLoading, setTxLoading] = useState(true)
  const [txNumberLoading, setTxNumberLoading] = useState(true)
  const [totalBalanceLoading, setTotalBalanceLoading] = useState(true)

  const [exportModalShown, setExportModalShown] = useState(false)

  // Default page
  const pageNumber = usePageNumber()

  // Address info
  useEffect(() => {
    if (!client || !id) return

    const fetchTxNumber = async () => {
      setTxNumberLoading(true)
      setTxNumber(undefined)

      try {
        const { data } = await client.addresses.getAddressesAddressTotalTransactions(id)
        setTxNumber(data)
      } catch (error) {
        console.error(error)
        setSnackbarMessage({
          text: getHumanReadableError(error, 'Error while fetching total transactions number'),
          type: 'alert'
        })
      }

      setTxNumberLoading(false)
    }

    const fetchTotalBalance = async () => {
      setTotalBalanceLoading(true)
      setTotalBalance(undefined)

      try {
        const { data } = await client.addresses.getAddressesAddressBalance(id)
        setTotalBalance(data)
      } catch (error) {
        console.error(error)
        setSnackbarMessage({
          text: getHumanReadableError(error, 'Error while fetching total balance'),
          type: 'alert'
        })
      }

      setTotalBalanceLoading(false)
    }

    fetchTxNumber()
    fetchTotalBalance()
  }, [client, id, setSnackbarMessage])

  // Address transactions
  useEffect(() => {
    if (!client || !id) return

    const fetchTransactions = async () => {
      setTxLoading(true)

      try {
        const { data } = await client.getAddressTransactions(id, pageNumber)
        if (data) setTxList(data)
      } catch (error) {
        console.error(error)
        setTxListError(getHumanReadableError(error, 'Error while fetching transaction list'))
      }

      setTxLoading(false)
    }

    fetchTransactions()
  }, [client, id, pageNumber])

  const handleExportModalOpen = () => setExportModalShown(true)

  const handleExportModalClose = () => setExportModalShown(false)

  if (!id) return null

  return (
    <Section>
      <SectionTitle title="Address" subtitle={<HighlightedHash text={id} textToCopy={id} />} />
      <TableAndQRCode>
        <Table bodyOnly minHeight={100}>
          <TableBody tdStyles={AddressTableBodyCustomStyles}>
            <TableRow>
              <span>Number of Transactions</span>
              {txNumberLoading ? (
                <LoadingSpinner size={14} />
              ) : (
                txNumber ?? <ErrorMessage>Could not get total number of transactions</ErrorMessage>
              )}
            </TableRow>
            {totalBalanceLoading ? (
              <>
                <TableRow>
                  <LoadingSpinner size={14} />
                </TableRow>
                <TableRow>
                  <LoadingSpinner size={14} />
                </TableRow>
              </>
            ) : totalBalance ? (
              <>
                <TableRow>
                  <span>Locked Balance</span>

                  <Badge type="neutral" amount={totalBalance?.lockedBalance} />
                </TableRow>
                <TableRow>
                  <b>Total Balance</b>
                  <Badge type="neutralHighlight" amount={totalBalance.balance} />
                </TableRow>
              </>
            ) : (
              <ErrorMessage>Could not get balance</ErrorMessage>
            )}
          </TableBody>
        </Table>
        <QRCodeWrapper>
          <QRCode size={130} value={id} bgColor="transparent" fgColor={theme.textPrimary} />
        </QRCodeWrapper>
      </TableAndQRCode>

      <SectionHeader>
        <h2>Transactions</h2>
        <Button onClick={handleExportModalOpen}>Export CSV ↓</Button>
      </SectionHeader>

      <Table hasDetails main scrollable isLoading={txLoading}>
        {txList && txList.length ? (
          <>
            <TableHeader
              headerTitles={[
                '',
                'Hash',
                <span key="timestamp">
                  Timestamp <TimestampExpandButton />
                </span>,
                '',
                'Account(s)',
                'Amount',
                ''
              ]}
              columnWidths={['20px', '15%', '100px', '80px', '25%', '120px', '30px']}
              textAlign={['left', 'left', 'left', 'left', 'left', 'right', 'left']}
            />
            <TableBody tdStyles={TxListCustomStyles}>
              {txList
                .sort((t1, t2) => (t2.timestamp && t1.timestamp ? t2.timestamp - t1.timestamp : 1))
                .map((t, i) => (
                  <AddressTransactionRow transaction={t} addressHash={id} key={i} />
                ))}
            </TableBody>
          </>
        ) : (
          <TableBody>
            <NoTxMessage>{txListError || 'No transactions yet'}</NoTxMessage>
          </TableBody>
        )}
      </Table>

      {txNumber ? <PageSwitch totalNumberOfElements={txNumber} /> : null}

      <ExportAddressTXsModal addressHash={id} isOpen={exportModalShown} onClose={handleExportModalClose} />
    </Section>
  )
}

interface AddressTransactionRowProps {
  transaction: Transaction
  addressHash: string
}

const AddressTransactionRow: FC<AddressTransactionRowProps> = ({ transaction: t, addressHash }) => {
  const { detailOpen, toggleDetail } = useTableDetailsState(false)

  let { alph: alphAmount } = calcTxAmountsDeltaForAddress(t, addressHash) // TODO: Support tokens

  alphAmount = alphAmount < 0 ? alphAmount * BigInt(-1) : alphAmount

  const infoType = isConsolidationTx(t) ? 'move' : getDirection(t, addressHash)
  const { amountTextColor, amountSign, Icon, iconColor } = useTransactionUI(infoType)

  const renderOutputAccounts = () => {
    if (!t.outputs) return
    // Check for auto-sent tx
    if (t.outputs.every((o) => o.address === addressHash)) {
      return <AddressLink key={addressHash} address={addressHash} maxWidth="250px" />
    } else {
      const outputs = _(t.outputs.filter((o) => o.address !== addressHash))
        .map((v) => v.address)
        .uniq()
        .value()

      return (
        <AccountsSummaryContainer>
          <AddressLink address={outputs[0]} maxWidth="250px" />
          {outputs.length > 1 && ` (+ ${outputs.length - 1})`}
        </AccountsSummaryContainer>
      )
    }
  }

  const renderInputAccounts = () => {
    if (!t.inputs) return
    const inputs = _(t.inputs.filter((o) => o.address !== addressHash))
      .map((v) => v.address)
      .uniq()
      .value()

    return inputs.length > 0 ? (
      <AccountsSummaryContainer>
        {inputs[0] && <AddressLink address={inputs[0]} maxWidth="250px" />}
        {inputs.length > 1 && ` (+ ${inputs.length - 1})`}
      </AccountsSummaryContainer>
    ) : (
      <BlockRewardLabel>Block rewards</BlockRewardLabel>
    )
  }

  const directionIconSize = 18

  return (
    <>
      <TableRow key={t.hash} isActive={detailOpen} onClick={toggleDetail}>
        <Icon size={directionIconSize} strokeWidth={3} color={iconColor} />

        <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="120px" />

        {(t.timestamp && <Timestamp timeInMs={t.timestamp} />) || '-'}

        <Badge
          type="neutral"
          content={infoType === 'move' ? 'Moved' : infoType === 'out' ? 'To' : 'From'}
          floatRight
          minWidth={60}
        />

        {infoType === 'move' || infoType === 'out' ? renderOutputAccounts() : renderInputAccounts()}
        <AmountCell color={amountTextColor}>
          {amountSign}
          <Amount value={alphAmount} />
        </AmountCell>
        <DetailToggle isOpen={detailOpen} />
      </TableRow>
      <TableDetailsRow openCondition={detailOpen}>
        <AnimatedCell colSpan={7}>
          <Table>
            <TableHeader headerTitles={['Inputs', '', 'Outputs']} columnWidths={['', '50px', '']} />
            <TableBody>
              <TableRow>
                <div>
                  {t.inputs && t.inputs.length > 0 ? (
                    t.inputs.map(
                      (input, i) =>
                        input.address && (
                          <AddressLink
                            key={i}
                            address={input.address}
                            txHashRef={input.txHashRef}
                            amount={BigInt(input.attoAlphAmount ?? 0)}
                            maxWidth="180px"
                          />
                        )
                    )
                  ) : (
                    <BlockRewardLabel>Block rewards</BlockRewardLabel>
                  )}
                </div>

                <span style={{ textAlign: 'center' }}>
                  <ArrowRight size={12} />
                </span>

                <div>
                  {t.outputs &&
                    t.outputs.map((output, i) => (
                      <AddressLink
                        key={i}
                        address={output.address}
                        amount={BigInt(output.attoAlphAmount)}
                        maxWidth="180px"
                        lockTime={(output as AssetOutput).lockTime}
                      />
                    ))}
                </div>
              </TableRow>
            </TableBody>
          </Table>
        </AnimatedCell>
      </TableDetailsRow>
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

const TxListCustomStyles: TDStyle[] = [
  {
    tdPos: 6,
    style: css`
      text-align: right;
    `
  }
]

const AccountsSummaryContainer = styled.div`
  display: flex;
  align-items: center;
`

const BlockRewardLabel = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-style: italic;
`

const NoTxMessage = styled.td`
  color: ${({ theme }) => theme.textSecondary};
  padding: 20px;
`

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-style: italic;
  font-weight: 400;
`

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 35px;
  margin-bottom: 10px;
`

const TableAndQRCode = styled.div`
  display: flex;
  gap: 20px;

  @media ${deviceBreakPoints.tiny} {
    flex-direction: column;
  }
`

const QRCodeWrapper = styled.div`
  border: ${({ theme }) => `1px solid ${theme.borderSecondary}`};
  ${({ theme }) => blurredBackground(theme.bgPrimary)};
  border-radius: 9px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default TransactionInfoPage

const AmountCell = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  font-weight: 600;
`
