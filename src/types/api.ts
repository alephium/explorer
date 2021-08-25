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
  startGas: number
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
  txNumber: number
}
