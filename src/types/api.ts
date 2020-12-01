export interface Block {
  hash: string
  height: number
  chainFrom: number
  chainTo: number
  timestamp: number
  txNumber: number
}

export interface BlockDetail {
  hash: string
  height: number
  chainFrom: number
  chainTo: number
  timestamp: number
  transactions: Transaction[]
}

export interface Transaction {
  hash: string
  timestamp: number
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
}

export interface TransactionInput {
  txHashRef: string
  address: string
  amount: number
  unlockScript: string
}

export interface TransactionOutput {
  amount: number
  createdHeight: number
  address: string
  spent: string
}

export interface Address {
  balance: number,
  transactions: Transaction[]
}
