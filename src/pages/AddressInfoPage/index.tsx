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

import { addressToGroup, calculateAmountWorth, getHumanReadableError, TOTAL_NUMBER_OF_GROUPS } from '@alephium/sdk'
import { AddressBalance, Transaction } from '@alephium/sdk/api/explorer'
import QRCode from 'qrcode.react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import { fetchAssetPrice } from '@/api/priceApi'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import Button from '@/components/Buttons/Button'
import TimestampExpandButton from '@/components/Buttons/TimestampExpandButton'
import HighlightedHash from '@/components/HighlightedHash'
import PageSwitch from '@/components/PageSwitch'
import Section from '@/components/Section'
import SectionTitle from '@/components/SectionTitle'
import Table, { TDStyle } from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import TableHeader from '@/components/Table/TableHeader'
import { useGlobalContext } from '@/contexts/global'
import usePageNumber from '@/hooks/usePageNumber'
import ExportAddressTXsModal from '@/modals/ExportAddressTXsModal'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { formatNumberForDisplay } from '@/utils/strings'

import AddressInfoGrid from './AddressInfoGrid'
import AddressTransactionRow from './AddressTransactionRow'

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
  const [addressWorth, setAddressWorth] = useState<number | undefined>(undefined)

  const [txLoading, setTxLoading] = useState(true)

  const [exportModalShown, setExportModalShown] = useState(false)

  // Default page
  const pageNumber = usePageNumber()

  // Address info
  useEffect(() => {
    if (!client || !id) return

    const fetchTxNumber = async () => {
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
    }

    const fetchTotalBalance = async () => {
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

  // Asset price (appox).
  // TODO: when listed tokens, add prices. ALPH only for now.
  useEffect(() => {
    const getAddressWorth = async () => {
      if (!totalBalance?.balance) return
      const price = await fetchAssetPrice('alephium')

      setAddressWorth(calculateAmountWorth(BigInt(totalBalance.balance), price))
    }
    getAddressWorth()
  }, [totalBalance?.balance])

  const handleExportModalOpen = () => setExportModalShown(true)

  const handleExportModalClose = () => setExportModalShown(false)

  if (!id) return null

  const addressGroup = addressToGroup(id, TOTAL_NUMBER_OF_GROUPS)

  return (
    <Section>
      <SectionTitle title="Address" subtitle={<HighlightedHash text={id} textToCopy={id} />} />
      <InfoGridAndQR>
        <InfoGrid>
          <InfoGrid.Cell
            label="ALPH balance"
            value={totalBalance && <Amount value={BigInt(totalBalance.balance)} />}
            sublabel={
              totalBalance?.lockedBalance && (
                <Badge
                  content={
                    <span>
                      Locked: <Amount value={BigInt(totalBalance.lockedBalance)} />
                    </span>
                  }
                  type="neutral"
                />
              )
            }
          />
          <InfoGrid.Cell label="Fiat price" value={addressWorth && <Amount value={addressWorth} isFiat suffix="$" />} />
          <InfoGrid.Cell
            label="Nb. of transaction"
            value={txNumber ? formatNumberForDisplay(txNumber, '') : undefined}
          />
          <InfoGrid.Cell label="Address group" value={addressGroup.toString()} />
          <InfoGrid.Cell label="Nb. of assets" value="TODO" />
          <InfoGrid.Cell label="Last activity" value="TODO" />
        </InfoGrid>
        <QRCodeCell>
          <QRCode size={130} value={id} bgColor="transparent" fgColor={theme.textPrimary} />
        </QRCodeCell>
      </InfoGridAndQR>

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

const TxListCustomStyles: TDStyle[] = [
  {
    tdPos: 6,
    style: css`
      text-align: right;
    `
  }
]

const NoTxMessage = styled.td`
  color: ${({ theme }) => theme.textSecondary};
  padding: 20px;
`

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 35px;
  margin-bottom: 10px;
`

const InfoGridAndQR = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${({ theme }) => theme.bgPrimary};
  width: 100%;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.borderPrimary};
  overflow: hidden;

  @media ${deviceBreakPoints.tablet} {
    flex-direction: column;
    height: auto;
  }
`

const InfoGrid = styled(AddressInfoGrid)`
  flex: 1;
`

const QRCodeCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bgSecondary};
  padding: 40px;
`

export default TransactionInfoPage
