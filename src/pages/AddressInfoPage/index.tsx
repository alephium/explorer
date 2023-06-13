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
import { ExplorerProvider, groupOfAddress } from '@alephium/web3'
import { AddressBalance, MempoolTransaction, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { sortBy, unionBy } from 'lodash'
import { FileDown } from 'lucide-react'
import QRCode from 'qrcode.react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePageVisibility } from 'react-page-visibility'
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
import { GlobalContextValue, useGlobalContext } from '@/contexts/global'
import useInterval from '@/hooks/useInterval'
import usePageNumber from '@/hooks/usePageNumber'
import ExportAddressTXsModal from '@/modals/ExportAddressTXsModal'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { AddressAssetsResult } from '@/types/addresses'
import { formatNumberForDisplay } from '@/utils/strings'

import AddressTransactionRow from './AddressTransactionRow'
import AssetList from './AssetList'
import AddressInfoGrid from './InfoGrid'

type ParamTypes = {
  id: string
}

type FetchedEntity = 'balance' | 'txNumber' | 'assets' | 'transactions'

type SingleStringArgFunctions<T> = {
  [K in keyof T]: T[K] extends (arg: string) => unknown ? K : never
}[keyof T]

const AddressInfoPage = () => {
  const theme = useTheme()
  const { id } = useParams<ParamTypes>()
  const { clients, setSnackbarMessage, networkType } = useGlobalContext()
  const isAppVisible = usePageVisibility()
  const pageNumber = usePageNumber()

  const [addressBalance, setAddressBalance] = useState<AddressBalance>()
  const [addressTransactionNumber, setAddressTransactionNumber] = useState<number>()
  const [addressAssets, setAddressAssets] = useState<AddressAssetsResult>()
  const [addressTransactions, setAddressTransactions] = useState<Transaction[]>()
  const [addressMempoolTransactions, setAddressMempoolTransactions] = useState<MempoolTransaction[]>()
  const [addressLatestActivity, setAddressLatestActivity] = useState<number>()
  const [addressWorth, setAddressWorth] = useState<number | undefined>(undefined)
  const [exportModalShown, setExportModalShown] = useState(false)

  const knownPendingTxs = useRef<MempoolTransaction[]>([])

  const [loadings, setLoadings] = useState<{ [key in FetchedEntity]: boolean }>({
    balance: true,
    txNumber: true,
    assets: true,
    transactions: true
  })

  const fetchDataGeneric = useCallback(
    async <T,>(
      fetchedEntity: FetchedEntity,
      setStateAction: (value: T | undefined) => void,
      apiCallName?: SingleStringArgFunctions<ExplorerProvider['addresses']>,
      customApiCall?: () => Promise<T>
    ) => {
      if (!clients || !id) return

      setLoadings((p) => ({ ...p, [fetchedEntity]: true }))
      setStateAction(undefined)

      try {
        const result = customApiCall
          ? await customApiCall()
          : apiCallName && ((await clients.explorer.addresses[apiCallName](id, {})) as T)
        setStateAction(result)
      } catch (error) {
        displayError(setSnackbarMessage, error, `Error while fetching ${fetchedEntity}`)
      } finally {
        setLoadings((p) => ({ ...p, [fetchedEntity]: false }))
      }
    },
    [clients, id, setSnackbarMessage]
  )

  const fetchTransactions = useCallback(
    () =>
      clients &&
      id &&
      fetchDataGeneric('transactions', setAddressTransactions, undefined, async () => {
        const currentPageTransactionData = await clients.explorer.addresses.getAddressesAddressTransactions(id, {
          page: pageNumber
        })
        const firstPageTransactionData = await clients.explorer.addresses.getAddressesAddressTransactions(id, {
          page: 1
        })
        setAddressLatestActivity(firstPageTransactionData[0]?.timestamp)

        return currentPageTransactionData
      }),
    [clients, fetchDataGeneric, id, pageNumber]
  )

  const fetchMempoolTxs = async () => {
    if (!clients || !id) return

    const mempoolTxs = await clients.explorer.addresses.getAddressesAddressMempoolTransactions(id)

    // Fetch settled TXs if mempool tx list length changed
    if (addressMempoolTransactions && addressMempoolTransactions.length > mempoolTxs.length) {
      fetchTransactions()
    }

    knownPendingTxs.current = unionBy(knownPendingTxs.current, addressMempoolTransactions, 'hash')

    setAddressMempoolTransactions(mempoolTxs)
  }

  // Fetch on mount
  useEffect(() => {
    if (clients && id) {
      fetchDataGeneric('balance', setAddressBalance, 'getAddressesAddressBalance')
      fetchDataGeneric('txNumber', setAddressTransactionNumber, 'getAddressesAddressTotalTransactions')
      fetchDataGeneric('assets', setAddressAssets, undefined, async () => fetchAddressAssets(clients, id, networkType))
      fetchTransactions()
    }
  }, [clients, fetchDataGeneric, fetchTransactions, id, networkType, pageNumber])

  // Mempool tx check
  useInterval(fetchMempoolTxs, 5000, !isAppVisible)

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
        displayError(setSnackbarMessage, error, 'Error while fetching fiat price')
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

  let assets = (addressAssets?.assets.map((a) => ({
    ...a,
    balance: BigInt(a.balance),
    lockedBalance: BigInt(a.lockedBalance)
  })) ?? []) as Asset[]

  if (totalBalance && lockedBalance && parseInt(totalBalance) > 0) {
    assets.push({ ...ALPH, balance: BigInt(totalBalance), lockedBalance: BigInt(lockedBalance), verified: true })
  }

  assets = sortBy(assets, [(a) => !a.verified, 'name'])

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

      <AssetList assets={assets} isLoading={loadings.assets} />

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
        {txList?.length || addressMempoolTransactions?.length ? (
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
              {addressMempoolTransactions &&
                addressMempoolTransactions.map((t, i) => (
                  <AddressTransactionRow transaction={t} addressHash={id} key={i} />
                ))}
              {txList &&
                txList
                  .sort((t1, t2) => (t2.timestamp && t1.timestamp ? t2.timestamp - t1.timestamp : 1))
                  .map((t, i) => <AddressTransactionRow transaction={t} addressHash={id} key={i} />)}
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

export default AddressInfoPage

const displayError = (
  setSnackbarMessage: GlobalContextValue['setSnackbarMessage'],
  error: unknown,
  errorMsg: string
) => {
  console.error(error)
  setSnackbarMessage({
    text: getHumanReadableError(error, errorMsg),
    type: 'alert'
  })
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
