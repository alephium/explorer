export interface Block {
  hash: string
  timestamp: number
  chainFrom: number
  chainTo: number
  height: number
  txNumber: number
  mainChain: boolean
}

export interface BlockDetail {
  hash: string
  height: number
  chainFrom: number
  chainTo: number
  timestamp: number
  mainChain: boolean
  deps: string[]
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
