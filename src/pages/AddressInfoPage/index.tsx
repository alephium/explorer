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

import { Asset, calculateAmountWorth, getHumanReadableError } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { groupOfAddress } from '@alephium/web3'
import { AddressBalance, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { sortBy } from 'lodash'
import { FileDown } from 'lucide-react'
import QRCode from 'qrcode.react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import { fetchAddressAssets } from '@/api/addressApi'
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
import Timestamp from '@/components/Timestamp'
import { useGlobalContext } from '@/contexts/global'
import usePageNumber from '@/hooks/usePageNumber'
import ExportAddressTXsModal from '@/modals/ExportAddressTXsModal'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { AddressAssetsResult } from '@/types/addresses'
import { getAssetInfo } from '@/utils/assets'
import { formatNumberForDisplay } from '@/utils/strings'

import AddressTransactionRow from './AddressTransactionRow'
import AssetList from './AssetList'
import AddressInfoGrid from './InfoGrid'

type ParamTypes = {
  id: string
}

const TransactionInfoPage = () => {
  const theme = useTheme()
  const { id } = useParams<ParamTypes>()
  const { client, setSnackbarMessage, networkType } = useGlobalContext()

  const [addressBalance, setAddressBalance] = useState<AddressBalance>()
  const [addressTransactionNumber, setAddressTransactionNumber] = useState<number>()
  const [addressAssets, setAddressAssets] = useState<AddressAssetsResult>()
  const [addressTransactions, setAddressTransactions] = useState<Transaction[]>()
  const [addressLatestActivity, setAddressLatestActivity] = useState<number>()

  const [loadings, setLoadings] = useState({
    balance: true,
    txNumber: true,
    assets: true,
    transactions: true
  })

  const [addressWorth, setAddressWorth] = useState<number | undefined>(undefined)

  const [exportModalShown, setExportModalShown] = useState(false)

  // Default page
  const pageNumber = usePageNumber()

  useEffect(() => {
    if (!client || !id) return

    const fetch = async () => {
      setLoadings((p) => ({ ...p, balance: true }))
      setAddressBalance(undefined)
      try {
        const balance = await client.addresses.getAddressesAddressBalance(id)
        setAddressBalance(balance)
      } catch (error) {
        console.error(error)
        setSnackbarMessage({
          text: getHumanReadableError(error, 'Error while fetching address balance'),
          type: 'alert'
        })
      } finally {
        setLoadings((p) => ({ ...p, balance: false }))
      }
    }

    fetch()
  }, [client, id, setSnackbarMessage])

  useEffect(() => {
    if (!client || !id) return

    const fetch = async () => {
      setLoadings((p) => ({ ...p, txNumber: true }))
      setAddressBalance(undefined)
      try {
        const txNumber = await client.addresses.getAddressesAddressTotalTransactions(id)
        setAddressTransactionNumber(txNumber)
      } catch (error) {
        console.error(error)
        setSnackbarMessage({
          text: getHumanReadableError(error, "Error while fetching address' transaction number"),
          type: 'alert'
        })
      } finally {
        setLoadings((p) => ({ ...p, txNumber: false }))
      }
    }

    fetch()
  }, [client, id, setSnackbarMessage])

  useEffect(() => {
    if (!client || !id) return

    const fetch = async () => {
      setLoadings((p) => ({ ...p, assets: true }))
      setAddressAssets(undefined)
      try {
        const assets = await fetchAddressAssets(client, id)
        setAddressAssets(assets)
      } catch (error) {
        console.error(error)
        setSnackbarMessage({
          text: getHumanReadableError(error, "Error while fetching address' assets"),
          type: 'alert'
        })
      } finally {
        setLoadings((p) => ({ ...p, assets: false }))
      }
    }

    fetch()
  }, [client, id, setSnackbarMessage])

  useEffect(() => {
    if (!client || !id) return

    const fetch = async () => {
      setLoadings((p) => ({ ...p, transactions: true }))
      setAddressTransactions(undefined)
      try {
        const firstPageTransactionData = await client.addresses.getAddressesAddressTransactions(id, { page: 1 })
        const currentPageTransactionData = await client.addresses.getAddressesAddressTransactions(id, {
          page: pageNumber
        })

        setAddressTransactions(currentPageTransactionData)
        setAddressLatestActivity(firstPageTransactionData[0]?.timestamp)
      } catch (error) {
        console.error(error)
        setSnackbarMessage({
          text: getHumanReadableError(error, "Error while fetching address' transactions"),
          type: 'alert'
        })
      } finally {
        setLoadings((p) => ({ ...p, transactions: false }))
      }
    }

    fetch()
  }, [client, id, pageNumber, setSnackbarMessage])

  // Asset price (appox).
  // TODO: when listed tokens, add resp. prices. ALPH only for now.
  useEffect(() => {
    setAddressWorth(undefined)

    const getAddressWorth = async () => {
      try {
        const balance = addressBalance?.balance
        if (!balance) return

        const price = await fetchAssetPrice('alephium')

        setAddressWorth(calculateAmountWorth(BigInt(balance), price))
      } catch (error) {
        console.error(error)
        setSnackbarMessage({
          text: getHumanReadableError(error, 'Error while fetching fiat price'),
          type: 'alert'
        })
      }
    }

    getAddressWorth()
  }, [addressBalance?.balance, setSnackbarMessage])

  const handleExportModalOpen = () => setExportModalShown(true)
  const handleExportModalClose = () => setExportModalShown(false)

  if (!id) return null

  const addressGroup = groupOfAddress(id)

  const totalBalance = addressBalance?.balance
  const lockedBalance = addressBalance?.lockedBalance
  const txNumber = addressTransactionNumber
  const txList = addressTransactions

  const assets = (addressAssets?.assets.map((a) => ({
    ...a,
    balance: BigInt(a.balance),
    lockedBalance: BigInt(a.lockedBalance),
    ...getAssetInfo({ assetId: a.id, networkType })
  })) ?? []) as Asset[]

  if (totalBalance && lockedBalance && parseInt(totalBalance) > 0) {
    assets.push({ ...ALPH, balance: BigInt(totalBalance), lockedBalance: BigInt(lockedBalance) })
  }

  return (
    <Section>
      <SectionTitle title="Address" subtitle={<HighlightedHash text={id} textToCopy={id} />} />
      <InfoGridAndQR>
        <InfoGrid>
          <InfoGrid.Cell
            label="ALPH balance"
            value={totalBalance && <Amount value={BigInt(totalBalance)} />}
            sublabel={
              lockedBalance &&
              lockedBalance !== '0' && (
                <Badge
                  content={
                    <span>
                      Locked: <Amount value={BigInt(lockedBalance)} />
                    </span>
                  }
                  type="neutral"
                />
              )
            }
          />
          <InfoGrid.Cell
            label="Fiat price"
            value={networkType === 'mainnet' ? addressWorth && <Amount value={addressWorth} isFiat suffix="$" /> : '-'}
          />
          <InfoGrid.Cell
            label="Nb. of transactions"
            value={txNumber ? formatNumberForDisplay(txNumber, '', 'quantity', 0) : !loadings.txNumber ? 0 : undefined}
          />
          <InfoGrid.Cell label="Nb. of assets" value={!loadings.assets ? assets.length : undefined} />
          <InfoGrid.Cell label="Address group" value={addressGroup.toString()} />
          <InfoGrid.Cell
            label="Latest activity"
            value={
              addressLatestActivity ? (
                <Timestamp timeInMs={addressLatestActivity} forceFormat="low" />
              ) : !loadings.transactions ? (
                'No activity yet'
              ) : undefined
            }
          />
        </InfoGrid>
        <QRCodeCell>
          <QRCode size={130} value={id} bgColor="transparent" fgColor={theme.font.primary} />
        </QRCodeCell>
      </InfoGridAndQR>

      <SectionHeader>
        <h2>Assets</h2>
      </SectionHeader>

      <AssetList assets={sortBy(assets, 'name')} isLoading={loadings.assets} />

      <SectionHeader>
        <h2>Transactions</h2>
        {txNumber && txNumber > 0 ? (
          <Button onClick={handleExportModalOpen}>
            <FileDown size={16} />
            Download CSV
          </Button>
        ) : null}
      </SectionHeader>

      <Table hasDetails main scrollable isLoading={loadings.transactions}>
        {txList?.length ? (
          <>
            <TableHeader
              headerTitles={[
                '',
                <span key="hash-time">
                  Hash & Time
                  <TimestampExpandButton />
                </span>,
                'Assets',
                '',
                'Addresses',
                'Amounts',
                ''
              ]}
              columnWidths={['45px', '15%', '100px', '80px', '25%', '120px', '25px']}
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
            <NoTxsMessage>
              <td>No transactions yet</td>
            </NoTxsMessage>
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
  },
  {
    tdPos: 7,
    style: css`
      padding: 0;
    `
  }
]

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
  background-color: ${({ theme }) => theme.bg.primary};
  width: 100%;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border.primary};
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
  background-color: ${({ theme }) => theme.bg.tertiary};
  padding: 40px;
  box-shadow: -1px 0 ${({ theme }) => theme.border.primary};
`

const NoTxsMessage = styled.tr`
  color: ${({ theme }) => theme.font.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 15px 20px;
`

export default TransactionInfoPage
