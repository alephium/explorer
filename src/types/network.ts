export const networkTypes = ['testnet', 'mainnet'] as const

export type NetworkType = typeof networkTypes[number]
