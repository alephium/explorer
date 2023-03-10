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

import { calcTxAmountsDeltaForAddress, getDirection, isConsolidationTx } from '@alephium/sdk'
import { AssetOutput } from '@alephium/sdk/api/alephium'
import { Transaction } from '@alephium/sdk/api/explorer'
import { ALPH } from '@alephium/token-list'
import _ from 'lodash'
import { ArrowRight } from 'lucide-react'
import { FC } from 'react'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Badge from '@/components/Badge'
import { AddressLink, TightLink } from '@/components/Links'
import Table from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import { AnimatedCell, DetailToggle, TableDetailsRow } from '@/components/Table/TableDetailsRow'
import TableHeader from '@/components/Table/TableHeader'
import TableRow from '@/components/Table/TableRow'
import Timestamp from '@/components/Timestamp'
import { useGlobalContext } from '@/contexts/global'
import useTableDetailsState from '@/hooks/useTableDetailsState'
import { useTransactionUI } from '@/hooks/useTransactionUI'
import { getAssetInfo } from '@/utils/assets'
import { convertToPositive } from '@/utils/numbers'

interface AddressTransactionRowProps {
  transaction: Transaction
  addressHash: string
}

const directionIconSize = 15

const AddressTransactionRow: FC<AddressTransactionRowProps> = ({ transaction: t, addressHash }) => {
  const { detailOpen, toggleDetail } = useTableDetailsState(false)
  const { networkType } = useGlobalContext()

  const infoType = isConsolidationTx(t) ? 'move' : getDirection(t, addressHash)
  const { amountTextColor, amountSign, Icon, iconColor, iconBgColor } = useTransactionUI(infoType)

  const { alph: alphAmount, tokens: tokenAmounts } = calcTxAmountsDeltaForAddress(t, addressHash)

  const amount = convertToPositive(alphAmount)
  const tokens = tokenAmounts.map((token) => ({ ...token, amount: convertToPositive(token.amount) }))

  const tokenAssets = [...tokens.map((token) => ({ ...token, ...getAssetInfo({ assetId: token.id, networkType }) }))]
  const assets = amount !== undefined ? [{ ...ALPH, amount }, ...tokenAssets] : tokenAssets

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

  return (
    <>
      <TableRow key={t.hash} isActive={detailOpen} onClick={toggleDetail}>
        <IconContainer style={{ backgroundColor: iconBgColor }}>
          <Icon size={directionIconSize} strokeWidth={2} color={iconColor} />
        </IconContainer>

        <HashAndTimestamp>
          <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="120px" />
          {(t.timestamp && <Timestamp timeInMs={t.timestamp} />) || '-'}
        </HashAndTimestamp>

        <Assets>
          {assets.map((t) => (
            <AssetLogo key={t.id} asset={t} size={21} />
          ))}
        </Assets>

        <Badge
          type="neutral"
          content={infoType === 'move' ? 'Moved' : infoType === 'out' ? 'To' : 'From'}
          floatRight
          minWidth={60}
        />

        {infoType === 'move' || infoType === 'out' ? renderOutputAccounts() : renderInputAccounts()}
        <AmountCell color={amountTextColor}>
          <Amount value={amount} prefix={amountSign} />
        </AmountCell>
        <DetailToggle isOpen={detailOpen} />
      </TableRow>
      <TableDetailsRow openCondition={detailOpen}>
        <AnimatedCell colSpan={7}>
          <Table>
            <TableHeader headerTitles={['Inputs', '', 'Outputs']} columnWidths={['', '50px', '']} compact />
            <TableBody>
              <TableRow>
                <div>
                  {t.inputs && t.inputs.length > 0 ? (
                    t.inputs.map(
                      (input) =>
                        input.address && (
                          <AddressLink
                            key={input.txHashRef}
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

export default AddressTransactionRow

const AccountsSummaryContainer = styled.div`
  display: flex;
  align-items: center;
`

const BlockRewardLabel = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-style: italic;
`

const AmountCell = styled.span<{ color: string }>`
  display: flex;
  flex-direction: column;
  color: ${({ color }) => color};
  font-weight: 600;
`

const IconContainer = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const HashAndTimestamp = styled.div`
  ${Timestamp} {
    color: ${({ theme }) => theme.font.tertiary};
    font-size: 12px;
    margin-top: 2px;
  }
`

const Assets = styled.div`
  display: flex;
  gap: 20px;
  row-gap: 10px;
  flex-wrap: wrap;
`
