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

import { explorer } from '@alephium/web3'
import _ from 'lodash'
import { RiArrowRightLine } from 'react-icons/ri'
import styled, { css, useTheme } from 'styled-components'

import { ALPH } from '@alephium/token-list'
import Badge from '@/components/Badge'
import { AddressLink, TightLink } from '@/components/Links'
import { AnimatedCell, DetailToggle, TableDetailsRow } from '@/components/Table/TableDetailsRow'
import TableRow from '@/components/Table/TableRow'
import useTableDetailsState from '@/hooks/useTableDetailsState'
import transactionIcon from '@/images/transaction-icon.svg'

interface TokenTransactionRowProps {
  transaction: explorer.Transaction
}

const TokenTransactionRow = ({ transaction }: TokenTransactionRowProps) => {
  const t = transaction
  const outputs = t.outputs as explorer.AssetOutput[]
  const { detailOpen, toggleDetail } = useTableDetailsState(false)

  const totalAmount = outputs?.reduce<bigint>((acc, o) => acc + BigInt(o.attoAlphAmount), BigInt(0))

  return (
    <>
      <TableRow key={t.hash} isActive={detailOpen} onClick={toggleDetail}>
        <TransactionIcon />
        <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="150px" />
        <span>
          {t.inputs ? t.inputs.length : 0} {t.inputs && t.inputs.length === 1 ? 'address' : 'addresses'}
        </span>
        <RiArrowRightLine size={15} />
        <span>
          {outputs ? outputs.length : 0} {outputs?.length === 1 ? 'address' : 'addresses'}
        </span>
        <Badge type="neutralHighlight" amount={totalAmount} floatRight />

        <DetailToggle isOpen={detailOpen} />
      </TableRow>
      <TableDetailsRow openCondition={detailOpen}>
        <td />
        <td />
        <AnimatedCell>
          {t.inputs &&
            t.inputs.map(
              (input, i) =>
                input.address && (
                  <AddressLink key={i} address={input.address} txHashRef={input.txHashRef} maxWidth="180px" />
                )
            )}
        </AnimatedCell>
        <td />
        <AnimatedCell colSpan={3}>
          <IODetailList>
            {outputs?.map((o, i) => (
              <AddressLink
                address={o.address}
                key={i}
                maxWidth="180px"
                amounts={[{ id: ALPH.id, amount: BigInt(o.attoAlphAmount) }]}
                lockTime={o.lockTime}
                flex
              />
            ))}
          </IODetailList>
        </AnimatedCell>
      </TableDetailsRow>
    </>
  )
}

export default TokenTransactionRow

const TransactionIcon = styled.div`
  background-image: url(${transactionIcon});
  background-position: center;
  background-repeat: no-repeat;
  height: 20px;
  width: 20px;
`

const IODetailList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 9px;
  padding: 15px;
`
