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

import { addApostrophes, calculateAmountWorth, getHumanReadableError, isAddressValid } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { contractIdFromAddress, groupOfAddress } from '@alephium/web3'
import { MempoolTransaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'qrcode.react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiFileDownloadLine } from 'react-icons/ri'
import { usePageVisibility } from 'react-page-visibility'
import { useNavigate, useParams } from 'react-router-dom'
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
import TokenTransactionRow from '@/pages/TokenInfoPage/TokenTransactionRow'
import AssetList from '@/pages/AddressInfoPage/AssetList'
import AddressInfoGrid from '@/pages/AddressInfoPage/InfoGrid'
import { deviceBreakPoints } from '@/styles/globalStyles'

type ParamTypes = {
  id: string
}

const numberOfTxsPerPage = 10

const TokenInfoPage = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { id } = useParams<ParamTypes>()
  const isAppVisible = usePageVisibility()
  const pageNumber = usePageNumber()
  const { displaySnackbar } = useSnackbar()
  const navigate = useNavigate()

  const [addressWorth, setTokenWorth] = useState<number | undefined>(undefined)
  const [exportModalShown, setExportModalShown] = useState(false)

  const lastKnownMempoolTxs = useRef<MempoolTransaction[]>([])

  const tokenHash = id ? id : ''

  const { data: addressBalance } = useQuery({
    ...queries.address.balance.details(tokenHash),
    enabled: !!tokenHash
  })

  const {
    data: txList,
    isLoading: txListLoading
  } = useQuery({
    ...queries.tokens.transactions.confirmed(tokenHash, pageNumber, numberOfTxsPerPage),
    enabled: !!tokenHash,
    keepPreviousData: true
  })


  return (
    <Section>
      <SectionTitle
        title={'Token'}
        subtitle={<HighlightedHash text={tokenHash} textToCopy={tokenHash} />}
      />

      <SectionHeader>
        <h2>{t('Transactions')}</h2>
      </SectionHeader>

      <Table hasDetails main scrollable isLoading={txListLoading}>
        {(!txListLoading && txList?.length) ? (
          <>
            <TableHeader
              headerTitles={[
                <span key="hash-time">
                  {t('Hash & Time')}
                  <TimestampExpandButton />
                </span>,
                'Assets',
                'Inputs',
                'Outputs',
                'Total Amounts',
                ''
              ]}
              columnWidths={['20%', '25%', '20%', '80px', '25%', '150px', '30px']}
              textAlign={['left', 'left', 'left', 'left', 'left', 'right', 'left']}
            />
            <TableBody tdStyles={TxListCustomStyles}>
              {txList &&
                txList
                  .sort((t1, t2) => (t2.timestamp && t1.timestamp ? t2.timestamp - t1.timestamp : 1))
                  .map((t, i) => (
                    <TokenTransactionRow
                      transaction={t}
                      tokenHash={tokenHash}
                      key={i}
                    />
                  ))}
            </TableBody>
          </>
        ) : (
          <TableBody>
            <NoTxsMessage>
              <td>{t('No transactions yet')}</td>
            </NoTxsMessage>
          </TableBody>
        )}
      </Table>
    </Section>
  )
}

export default TokenInfoPage

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

