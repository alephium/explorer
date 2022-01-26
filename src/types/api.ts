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
export interface BlockList {
  total: number
  blocks: Block[]
}

export interface Block {
  hash: string
  timestamp: number
  chainFrom: number
  chainTo: number
  height: number
  txNumber: number
  mainChain: boolean
}

export interface Transaction {
  type: 'confirmed' | 'unconfirmed'
  hash: string
  blockHash?: string
  timestamp?: number
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
  gasAmount: number
  gasPrice: number
}

export interface TransactionInput {
  txHashRef: string
  address: string
  amount: string
  unlockScript: string
}

export interface TransactionOutput {
  amount: string
  createdHeight: number
  address: string
  spent: string
}

export interface Address {
  balance: number
  lockedBalance: number
  txNumber: number
}
