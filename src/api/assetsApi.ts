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

import { TokenList } from '@alephium/token-list'
import { createQueryKeyStore } from '@lukemorales/query-key-factory'

import { VerifiedFungibleTokenMetadata } from '@/types/assets'
import { NetworkType } from '@/types/network'

import client from './client'

export const assetsQueries = createQueryKeyStore({
  metadata: {
    allVerifiedTokens: (network: NetworkType) => ({
      queryKey: [network],
      queryFn: (): Promise<VerifiedFungibleTokenMetadata[]> =>
        fetch(`https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`).then((r) =>
          r.json().then((j: TokenList) => j.tokens.map((v) => ({ ...v, verified: true })))
        )
    }),
    unverifiedFungibleToken: (assetId: string) => ({
      queryKey: [assetId],
      queryFn: () =>
        client.node.fetchFungibleTokenMetaData(assetId).then((r) => ({ id: assetId, verified: false, ...r }))
    }),
    unverifiedNFT: (assetId: string) => ({
      queryKey: [assetId],
      queryFn: () => client.node.fetchNFTMetaData(assetId).then((r) => ({ id: assetId, verified: false, ...r }))
    })
  },
  // TODO: This may be moved in a balancesApi file in the future?
  balances: {
    addressToken: (addressHash: string, tokenId: string) => ({
      queryKey: [addressHash, tokenId],
      queryFn: () =>
        client.explorer.addresses
          .getAddressesAddressTokensTokenIdBalance(addressHash, tokenId)
          .then((balance) => ({ id: tokenId, ...balance }))
    })
  }
})
