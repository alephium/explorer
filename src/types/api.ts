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
  blockHash: string
  timestamp: number
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
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
  balance: string
  transactions: Transaction[]
}
