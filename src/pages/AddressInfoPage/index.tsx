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

import { Asset, calculateAmountWorth, getHumanReadableError, TokenDisplayBalances } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { ExplorerProvider, groupOfAddress } from '@alephium/web3'
import { AddressBalance, MempoolTransaction, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { sortBy } from 'lodash'
import { FileDown } from 'lucide-react'
import QRCode from 'qrcode.react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePageVisibility } from 'react-page-visibility'
import { useParams } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import { fetchAddressAssets } from '@/api/addressApi'
import client from '@/api/client'
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
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useInterval from '@/hooks/useInterval'
import usePageNumber from '@/hooks/usePageNumber'
import { useSnackbar } from '@/hooks/useSnackbar'
import ExportAddressTXsModal from '@/modals/ExportAddressTXsModal'
import { syncUnknownAssetsInfo } from '@/store/assetsMetadata/assetsMetadataActions'
import { selectAllFungibleTokensMetadata } from '@/store/assetsMetadata/assetsMetadataSelectors'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { AssetBase } from '@/types/assets'
import { formatNumberForDisplay } from '@/utils/strings'

import AddressTransactionRow from './AddressTransactionRow'
import AssetList from './AssetList'
import AddressInfoGrid from './InfoGrid'

type ParamTypes = {
  id: string
}

type AddressPropertyName = 'balance' | 'txNumber' | 'assets' | 'txList'

type SingleStringArgFunctions<T> = {
  [K in keyof T]: T[K] extends (arg: string) => unknown ? K : never
}[keyof T]

const AddressInfoPage = () => {
  const theme = useTheme()
  const { id: addressHash } = useParams<ParamTypes>()
  const isAppVisible = usePageVisibility()
  const pageNumber = usePageNumber()
  const { displaySnackbar } = useSnackbar()

  const [addressBalance, setAddressBalance] = useState<AddressBalance>()
  const [txNumber, setTxNumber] = useState<number>()
  const [addressAssets, setAddressAssets] = useState<AssetBase[]>()
  const [txList, setTxList] = useState<Transaction[]>()
  const [addressMempoolTransactions, setAddressMempoolTransactions] = useState<MempoolTransaction[]>([])
  const [addressLatestActivity, setAddressLatestActivity] = useState<number>()
  const [addressWorth, setAddressWorth] = useState<number | undefined>(undefined)
  const [exportModalShown, setExportModalShown] = useState(false)

  const [loadings, setLoadings] = useState<{ [key in AddressPropertyName]: boolean }>({
    balance: true,
    txNumber: true,
    txList: true,
    assets: true
  })

  const displayError = useCallback(
    (error: unknown, errorMsg: string) => {
      console.error(error)
      displaySnackbar({
        text: getHumanReadableError(error, errorMsg),
        type: 'alert'
      })
    },
    [displaySnackbar]
  )

  const fetchAddressDataGeneric = useCallback(
    async <T,>(
      addressPropName: AddressPropertyName,
      setAddressProp: (value: T | undefined) => void,
      apiCall: SingleStringArgFunctions<ExplorerProvider['addresses']> | (() => Promise<T>)
    ) => {
      if (!addressHash) return

      setLoadings((p) => ({ ...p, [addressPropName]: true }))
      setAddressProp(undefined)

      try {
        const result =
          typeof apiCall === 'string'
            ? ((await client.explorer.addresses[apiCall](addressHash, {})) as T)
            : await apiCall()
        setAddressProp(result)
      } catch (error) {
        displayError(error, `Error while fetching ${addressPropName}`)
      } finally {
        setLoadings((p) => ({ ...p, [addressPropName]: false }))
      }
    },
    [displayError, addressHash]
  )

  const fetchTransactions = useCallback(
    () =>
      addressHash &&
      fetchAddressDataGeneric('txList', setTxList, async () => {
        const currentPageTransactionData = await client.explorer.addresses.getAddressesAddressTransactions(
          addressHash,
          {
            page: pageNumber
          }
        )
        const firstPageTransactionData = await client.explorer.addresses.getAddressesAddressTransactions(addressHash, {
          page: 1
        })
        setAddressLatestActivity(firstPageTransactionData[0]?.timestamp)

        return currentPageTransactionData
      }),
    [fetchAddressDataGeneric, addressHash, pageNumber]
  )

  const fetchMempoolTxs = useCallback(
    async (shouldTriggerTxFetch = true) => {
      if (!client || !addressHash) return

      try {
        const addressMempoolTransactionsHashes = new Set(addressMempoolTransactions.map((t) => t.hash))
        const mempoolTxs = await client.explorer.addresses.getAddressesAddressMempoolTransactions(addressHash)

        if (
          addressMempoolTransactions.length === mempoolTxs.length &&
          mempoolTxs.every((t) => addressMempoolTransactionsHashes.has(t.hash))
        )
          return

        if (shouldTriggerTxFetch && addressMempoolTransactions.length > mempoolTxs.length) {
          await fetchTransactions()
        }

        setAddressMempoolTransactions(mempoolTxs)
      } catch (e) {
        displayError(e, `Error while fetching pending transactions`)
      }
    },
    [addressMempoolTransactions, displayError, fetchTransactions, addressHash]
  )

  // Fetch on mount
  useEffect(() => {
    if (addressHash) {
      fetchAddressDataGeneric('balance', setAddressBalance, 'getAddressesAddressBalance')
      fetchAddressDataGeneric('txNumber', setTxNumber, 'getAddressesAddressTotalTransactions')
      fetchAddressDataGeneric('assets', setAddressAssets, async () => fetchAddressAssets(addressHash))
      fetchTransactions()
    }
  }, [fetchAddressDataGeneric, fetchTransactions, addressHash, pageNumber])

  useEffect(() => {
    fetchMempoolTxs(false)
  }, [fetchMempoolTxs])

  // Mempool tx check
  useInterval(fetchMempoolTxs, 10000, !isAppVisible)

  // Asset price
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
        displayError(error, 'Error while fetching fiat price')
      }
    }

    getAddressWorth()
  }, [addressBalance?.balance, displayError])

  const totalBalance = addressBalance?.balance
  const lockedBalance = addressBalance?.lockedBalance

  const nbOfAssets = !loadings.assets
    ? addressAssets && addressAssets?.length + (totalBalance && BigInt(totalBalance) > 0 ? 1 : 0)
    : undefined

  const handleExportModalOpen = () => setExportModalShown(true)
  const handleExportModalClose = () => setExportModalShown(false)

  if (!addressHash) return null

  const addressGroup = groupOfAddress(addressHash)

  return (
    <Section>
      <SectionTitle title="Address" subtitle={<HighlightedHash text={addressHash} textToCopy={addressHash} />} />
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
            value={
              client.networkType === 'mainnet' ? addressWorth && <Amount value={addressWorth} isFiat suffix="$" /> : '-'
            }
          />
          <InfoGrid.Cell
            label="Nb. of transactions"
            value={txNumber ? formatNumberForDisplay(txNumber, '', 'quantity', 0) : !loadings.txNumber ? 0 : undefined}
          />
          <InfoGrid.Cell label="Nb. of assets" value={nbOfAssets} />
          <InfoGrid.Cell label="Address group" value={addressGroup.toString()} />
          <InfoGrid.Cell
            label="Latest activity"
            value={
              addressLatestActivity ? (
                <Timestamp timeInMs={addressLatestActivity} forceFormat="low" />
              ) : !loadings.txList ? (
                'No activity yet'
              ) : undefined
            }
          />
        </InfoGrid>
        <QRCodeCell>
          <QRCode size={130} value={addressHash} bgColor="transparent" fgColor={theme.font.primary} />
        </QRCodeCell>
      </InfoGridAndQR>

      <SectionHeader>
        <h2>Assets</h2>
      </SectionHeader>

      <AssetList
        addressBalance={addressBalance}
        addressHash={addressHash}
        assets={addressAssets}
        isLoading={loadings.assets}
      />

      <SectionHeader>
        <h2>Transactions</h2>
        {txNumber && txNumber > 0 ? (
          <Button onClick={handleExportModalOpen}>
            <FileDown size={16} />
            Download CSV
          </Button>
        ) : null}
      </SectionHeader>

      <Table hasDetails main scrollable isLoading={loadings.txList}>
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
                  <AddressTransactionRow transaction={t} addressHash={addressHash} key={i} />
                ))}
              {txList &&
                txList
                  .sort((t1, t2) => (t2.timestamp && t1.timestamp ? t2.timestamp - t1.timestamp : 1))
                  .map((t, i) => <AddressTransactionRow transaction={t} addressHash={addressHash} key={i} />)}
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

      <ExportAddressTXsModal addressHash={addressHash} isOpen={exportModalShown} onClose={handleExportModalClose} />
    </Section>
  )
}

export default AddressInfoPage

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
