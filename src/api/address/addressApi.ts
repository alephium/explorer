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

import { createQueryKeyStore } from '@lukemorales/query-key-factory'

import client from '../client'

export const addressQueries = createQueryKeyStore({
  balance: {
    details: (addressHash: string) => ({
      queryKey: [addressHash],
      queryFn: () => client.explorer.addresses.getAddressesAddressBalance(addressHash)
    })
  },
  transactions: {
    settled: (addressHash: string, pageNumber: number, limit?: number) => ({
      queryKey: [addressHash, pageNumber, limit],
      queryFn: () =>
        client.explorer.addresses.getAddressesAddressTransactions(addressHash, {
          page: pageNumber,
          limit
        })
    }),
    mempool: (addressHash: string) => ({
      queryKey: [addressHash],
      queryFn: () => client.explorer.addresses.getAddressesAddressMempoolTransactions(addressHash)
    }),
    txNumber: (addressHash: string) => ({
      queryKey: [addressHash],
      queryFn: () => client.explorer.addresses.getAddressesAddressTotalTransactions(addressHash)
    })
  },
  assets: {
    all: (addressHash: string) => ({
      queryKey: [addressHash],
      queryFn: () => client.explorer.addresses.getAddressesAddressTokens(addressHash)
    })
  }
})
