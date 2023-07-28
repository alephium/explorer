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

import { calculateAmountWorth, getHumanReadableError } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { groupOfAddress } from '@alephium/web3'
import { MempoolTransaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'qrcode.react'
import { useEffect, useRef, useState } from 'react'
import { RiFileDownloadLine } from 'react-icons/ri'
import { usePageVisibility } from 'react-page-visibility'
import { useParams } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import { queries } from '@/api'
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
import usePageNumber from '@/hooks/usePageNumber'
import { useSnackbar } from '@/hooks/useSnackbar'
import ExportAddressTXsModal from '@/modals/ExportAddressTXsModal'
import AddressTransactionRow from '@/pages/AddressInfoPage/AddressTransactionRow'
import AssetList from '@/pages/AddressInfoPage/AssetList'
import AddressInfoGrid from '@/pages/AddressInfoPage/InfoGrid'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { formatNumberForDisplay } from '@/utils/strings'

type ParamTypes = {
  id: string
}

const numberOfTxsPerPage = 10

const AddressInfoPage = () => {
  const theme = useTheme()
  const { id: addressHash = '' } = useParams<ParamTypes>()
  const isAppVisible = usePageVisibility()
  const pageNumber = usePageNumber()
  const { displaySnackbar } = useSnackbar()

  const [addressWorth, setAddressWorth] = useState<number | undefined>(undefined)
  const [exportModalShown, setExportModalShown] = useState(false)

  const lastKnownMempoolTxs = useRef<MempoolTransaction[]>([])

  const { data: addressBalance } = useQuery({
    ...queries.address.balance.details(addressHash),
    enabled: !!addressHash
  })

  const {
    data: txList,
    isLoading: txListLoading,
    refetch: refetchTxList
  } = useQuery({
    ...queries.address.transactions.confirmed(addressHash, pageNumber, numberOfTxsPerPage),
    enabled: !!addressHash,
    keepPreviousData: true
  })

  const { data: latestTransaction } = useQuery({
    ...queries.address.transactions.confirmed(addressHash, 1, 1),
    enabled: !!addressHash
  })

  const { data: addressMempoolTransactions = [] } = useQuery({
    ...queries.address.transactions.mempool(addressHash),
    enabled: !!addressHash,
    refetchInterval: isAppVisible && pageNumber === 1 ? 10000 : undefined
  })

  const { data: txNumber, isLoading: txNumberLoading } = useQuery({
    ...queries.address.transactions.txNumber(addressHash),
    enabled: !!addressHash
  })

  const { data: addressAssetIds = [], isLoading: assetsLoading } = useQuery({
    ...queries.address.assets.all(addressHash),
    enabled: !!addressHash
  })

  const addressLatestActivity =
    latestTransaction && latestTransaction.length > 0 ? latestTransaction[0].timestamp : undefined

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
      } catch (e) {
        console.error(e)
        displaySnackbar({
          text: getHumanReadableError(e, 'Error while fetching fiat worth'),
          type: 'alert'
        })
      }
    }

    getAddressWorth()
  }, [addressBalance?.balance, displaySnackbar])

  // Refetch TXs when less txs are found in mempool
  useEffect(() => {
    if (addressMempoolTransactions.length < lastKnownMempoolTxs.current.length) {
      refetchTxList()
    }
    lastKnownMempoolTxs.current = addressMempoolTransactions
  }, [addressMempoolTransactions, refetchTxList])

  const totalBalance = addressBalance?.balance
  const lockedBalance = addressBalance?.lockedBalance

  const totalNbOfAssets =
    addressAssetIds.length +
    ((totalBalance && BigInt(totalBalance) > 0) || (lockedBalance && BigInt(lockedBalance) > 0) ? 1 : 0)

  const handleExportModalOpen = () => setExportModalShown(true)
  const handleExportModalClose = () => setExportModalShown(false)

  if (!addressHash) return null

  let addressGroup

  try {
    addressGroup = groupOfAddress(addressHash)
  } catch (e) {
    console.log(e)
  }

  return (
    <Section>
      <SectionTitle title="Address" subtitle={<HighlightedHash text={addressHash} textToCopy={addressHash} />} />
      <InfoGridAndQR>
        <InfoGrid>
          <InfoGrid.Cell
            label="ALPH balance"
            value={totalBalance && <Amount assetId={ALPH.id} value={BigInt(totalBalance)} />}
            sublabel={
              lockedBalance &&
              lockedBalance !== '0' && (
                <Badge
                  content={
                    <span>
                      Locked: <Amount assetId={ALPH.id} value={BigInt(lockedBalance)} />
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
              client.networkType === 'mainnet'
                ? addressWorth && <Amount assetId={ALPH.id} value={addressWorth} isFiat suffix="$" />
                : '-'
            }
          />
          <InfoGrid.Cell
            label="Nb. of transactions"
            value={txNumber ? formatNumberForDisplay(txNumber, '', 'quantity', 0) : !txNumberLoading ? 0 : undefined}
          />
          <InfoGrid.Cell label="Nb. of assets" value={totalNbOfAssets} />
          <InfoGrid.Cell label="Address group" value={addressGroup?.toString()} />
          <InfoGrid.Cell
            label="Latest activity"
            value={
              addressLatestActivity ? (
                <Timestamp timeInMs={addressLatestActivity} forceFormat="low" />
              ) : !txListLoading ? (
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
        assetIds={addressAssetIds}
        assetsLoading={assetsLoading}
      />

      <SectionHeader>
        <h2>Transactions</h2>
        {txNumber && txNumber > 0 ? (
          <Button onClick={handleExportModalOpen}>
            <RiFileDownloadLine size={16} />
            Download CSV
          </Button>
        ) : null}
      </SectionHeader>

      <Table hasDetails main scrollable isLoading={txListLoading}>
        {(!txListLoading && txList?.length) || addressMempoolTransactions?.length ? (
          <>
            <TableHeader
              headerTitles={[
                <span key="hash-time">
                  Hash & Time
                  <TimestampExpandButton />
                </span>,
                'Type',
                'Assets',
                '',
                'Addresses',
                'Amounts',
                ''
              ]}
              columnWidths={['20%', '15%', '20%', '80px', '25%', '120px', '25px']}
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

      {txNumber ? <PageSwitch totalNumberOfElements={txNumber} elementsPerPage={numberOfTxsPerPage} /> : null}

      <ExportAddressTXsModal addressHash={addressHash} isOpen={exportModalShown} onClose={handleExportModalClose} />
    </Section>
  )
}

export default AddressInfoPage

const TxListCustomStyles: TDStyle[] = [
  {
    tdPos: 3,
    style: css`
      min-width: 100px;
    `
  },
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
  border-radius: 9px;
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
