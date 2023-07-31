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

import { isMempoolTx } from '@alephium/sdk'
import { MempoolTransaction, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import _ from 'lodash'
import { RiArrowRightLine } from 'react-icons/ri'
import styled, { css, useTheme } from 'styled-components'

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
import useTableDetailsState from '@/hooks/useTableDetailsState'
import { getTransactionUI, useTransactionUI } from '@/hooks/useTransactionUI'
import { useTransactionInfo } from '@/utils/transactions'

interface AddressTransactionRowProps {
  transaction: Transaction | MempoolTransaction
  addressHash: string
}

const directionIconSize = 14

const AddressTransactionRow: FC<AddressTransactionRowProps> = ({ transaction: t, addressHash }) => {
  const { detailOpen, toggleDetail } = useTableDetailsState(false)
  const theme = useTheme()

  const { assets, infoType } = useTransactionInfo(t, addressHash)
  const { label, Icon, iconColor, iconBgColor, badgeText } = useTransactionUI(infoType)

  const isMoved = infoType === 'move'
  const isPending = isMempoolTx(t)

  // Override badge if it's a failed script execution.
  // TODO: Better (better way to define infoType by looking at presence of script)
  const isFailedScriptExecution = (t as Transaction).scriptExecutionOk === false
  const {
    iconColor: dAppIconColor,
    Icon: dAppIcon,
    iconBgColor: dAppIconBgColor,
    label: dAppLabel
  } = getTransactionUI('swap', theme)

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
      <TableRowStyled key={t.hash} isActive={detailOpen} onClick={toggleDetail} pending={isPending}>
        <HashAndTimestamp>
          <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="120px" />
          {!isPending && t.timestamp && <Timestamp timeInMs={t.timestamp} />}
        </HashAndTimestamp>
        <IconContainer
          style={{
            backgroundColor: isFailedScriptExecution ? dAppIconBgColor : iconBgColor,
            border: `1px solid ${iconBgColor}`
          }}
        >
          <Icon size={directionIconSize} color={isFailedScriptExecution ? dAppIconColor : iconColor} />
          <TxLabel style={{ color: isFailedScriptExecution ? dAppIconColor : iconColor }}>
            {isFailedScriptExecution ? dAppLabel : label}
          </TxLabel>
          {!isPending && !t.scriptExecutionOk && <FailedTXBubble data-tip="Script execution failed">!</FailedTXBubble>}
        </IconContainer>

        <Assets>
          {assets.map((a) => (
            <AssetLogo key={a.id} assetId={a.id} size={21} showTooltip />
          ))}
        </Assets>

        <Badge type="neutral" compact content={badgeText} floatRight minWidth={40} />

        {!isPending && (infoType === 'move' || infoType === 'out' ? renderOutputAccounts() : renderInputAccounts())}
        {!isPending && (
          <AmountCell>
            {assets.map(({ id, amount, symbol, decimals }) => (
              <Amount
                key={id}
                assetId={id}
                value={amount}
                highlight={!isMoved}
                showPlusMinus={!isMoved}
                color={isMoved ? theme.font.secondary : undefined}
                suffix={symbol}
                decimals={decimals}
              />
            ))}
          </AmountCell>
        )}
        {!isPending && <DetailToggle isOpen={detailOpen} />}
      </TableRowStyled>
      {!isPending && (
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
                    <RiArrowRightLine size={12} />
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
      )}
    </>
  )
}

export default AddressTransactionRow

const TableRowStyled = styled(TableRow)<{ pending: boolean }>`
  ${({ pending, theme }) =>
    pending &&
    css`
      background-color: ${theme.bg.secondary};
      border-bottom: 1px solid ${theme.border.secondary};
      cursor: initial;

      > * {
        opacity: 0.5;
        animation: opacity-breathing 2s ease infinite;
      }

      @keyframes opacity-breathing {
        0% {
          opacity: 0.4;
        }
        50% {
          opacity: 0.8;
        }
        100% {
          opacity: 0.4;
        }
      }
    `}
`

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
  padding: 2px 5px;
  border-radius: 4px;
  gap: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  float: left;
`

const TxLabel = styled.div`
  font-size: 11px;
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
  border-radius: 9px;
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
