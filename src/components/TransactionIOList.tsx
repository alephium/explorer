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

import { AssetOutput, Input, Output } from '@alephium/sdk/api/explorer'
import { ALPH } from '@alephium/token-list'
import { ReactElement, ReactNode } from 'react'

import { AddressLink } from './Links'

interface TransactionIOListProps {
  ioList: Input[] | Output[]
  flex?: boolean
  addressMaxWidth?: string
  IOItemWrapper?: ({ children }: { children: ReactNode }) => ReactElement
}

const TransactionIOList = ({ ioList, flex, addressMaxWidth, IOItemWrapper }: TransactionIOListProps) => (
  <>
    {ioList.map((io, i) => {
      if (!io.address) return null

      const amounts = [{ id: ALPH.id, amount: BigInt(io.attoAlphAmount ?? 0) }]

      if (io.tokens) {
        amounts.push(...io.tokens.map((t) => ({ id: t.id, amount: BigInt(t.amount) })))
      }

      const IOAddressLink = (
        <AddressLink
          address={io.address}
          txHashRef={(io as Input).txHashRef}
          lockTime={(io as AssetOutput).lockTime}
          amounts={amounts}
          maxWidth={addressMaxWidth}
          flex={flex}
        />
      )

      return IOItemWrapper !== undefined ? (
        <IOItemWrapper key={`${io.address}-${i}`}>{IOAddressLink}</IOItemWrapper>
      ) : (
        IOAddressLink
      )
    })}
  </>
)

export default TransactionIOList
