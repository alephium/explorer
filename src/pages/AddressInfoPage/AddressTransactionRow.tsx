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

import { Transaction } from '@alephium/sdk/api/explorer'
import _ from 'lodash'
import { ArrowRight } from 'lucide-react'
import { FC } from 'react'
import styled, { useTheme } from 'styled-components'

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
import TransactionIOList from '@/components/TransactionIOList'
import { useGlobalContext } from '@/contexts/global'
import useTableDetailsState from '@/hooks/useTableDetailsState'
import { useTransactionUI } from '@/hooks/useTransactionUI'
import { getTransactionInfo } from '@/utils/transactions'

interface AddressTransactionRowProps {
  transaction: Transaction
  addressHash: string
}

const directionIconSize = 13

const AddressTransactionRow: FC<AddressTransactionRowProps> = ({ transaction: t, addressHash }) => {
  const { detailOpen, toggleDetail } = useTableDetailsState(false)
  const { networkType } = useGlobalContext()
  const theme = useTheme()

  const { assets, infoType } = getTransactionInfo(t, addressHash, networkType)
  const { Icon, iconColor, iconBgColor } = useTransactionUI(infoType)
  const isMoved = infoType === 'move'

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
        <div>
          <AddressLink address={outputs[0]} maxWidth="250px" />
          {outputs.length > 1 && ` (+ ${outputs.length - 1})`}
        </div>
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
      <div>
        {inputs[0] && <AddressLink address={inputs[0]} maxWidth="250px" />}
        {inputs.length > 1 && ` (+ ${inputs.length - 1})`}
      </div>
    ) : (
      <BlockRewardLabel>Block rewards</BlockRewardLabel>
    )
  }

  return (
    <>
      <TableRow key={t.hash} isActive={detailOpen} onClick={toggleDetail}>
        <IconContainer style={{ backgroundColor: iconBgColor, border: `1px solid ${iconBgColor}` }}>
          <Icon size={directionIconSize} strokeWidth={3} color={iconColor} />
          {!t.scriptExecutionOk && <FailedTXBubble data-tip="Script execution failed">!</FailedTXBubble>}
        </IconContainer>

        <HashAndTimestamp>
          <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="120px" />
          {(t.timestamp && <Timestamp timeInMs={t.timestamp} />) || '-'}
        </HashAndTimestamp>

        <Assets>
          {assets.map((a) => (
            <AssetLogo key={a.id} asset={a} size={21} showTooltip />
          ))}
        </Assets>

        <Badge
          type="neutralHighlight"
          content={infoType === 'move' ? 'Moved' : infoType === 'out' ? 'To' : infoType === 'swap' ? 'Swap' : 'From'}
          floatRight
          minWidth={60}
        />

        {infoType === 'move' || infoType === 'out' ? renderOutputAccounts() : renderInputAccounts()}
        <AmountCell>
          {assets.map(({ id, amount, symbol, decimals }) => (
            <Amount
              key={id}
              value={amount}
              highlight={!isMoved}
              showPlusMinus={!isMoved}
              color={isMoved ? theme.font.secondary : undefined}
              suffix={symbol}
              decimals={decimals}
              isUnknownToken={!symbol}
            />
          ))}
        </AmountCell>
        <DetailToggle isOpen={detailOpen} />
      </TableRow>
      <TableDetailsRow openCondition={detailOpen}>
        <AnimatedCell colSpan={7}>
          <Table>
            <TableHeader headerTitles={['Inputs', '', 'Outputs']} columnWidths={['', '50px', '']} compact />
            <TableBody>
              <TableRow>
                <IODetailList>
                  {t.inputs && t.inputs.length > 0 ? (
                    <TransactionIOList
                      inputs={t.inputs}
                      IOItemWrapper={IODetailsContainer}
                      addressMaxWidth="180px"
                      flex
                    />
                  ) : (
                    <BlockRewardInputLabel>Block rewards</BlockRewardInputLabel>
                  )}
                </IODetailList>

                <span style={{ textAlign: 'center' }}>
                  <ArrowRight size={12} />
                </span>

                <IODetailList>
                  {t.outputs && (
                    <TransactionIOList
                      outputs={t.outputs}
                      IOItemWrapper={IODetailsContainer}
                      addressMaxWidth="180px"
                      flex
                    />
                  )}
                </IODetailList>
              </TableRow>
            </TableBody>
          </Table>
        </AnimatedCell>
      </TableDetailsRow>
    </>
  )
}

export default AddressTransactionRow

const BlockRewardLabel = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-style: italic;
`

const BlockRewardInputLabel = styled(BlockRewardLabel)`
  padding: 18px 15px;
  text-align: center;
`

const AmountCell = styled.span`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-weight: 600;
`

const IconContainer = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`

const HashAndTimestamp = styled.div`
  ${Timestamp} {
    color: ${({ theme }) => theme.font.secondary};
    font-size: 12px;
    margin-top: 2px;
  }
`

const Assets = styled.div`
  display: flex;
  gap: 15px;
  row-gap: 15px;
  flex-wrap: wrap;
`

const IODetailList = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 12px;
`

const IODetailsContainer = styled.div`
  padding: 15px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const FailedTXBubble = styled.div`
  position: absolute;
  height: 14px;
  width: 14px;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.global.alert};
  color: white;
  top: -7px;
  right: -7px;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
`
