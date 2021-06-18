// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { Block, BlockDetail, Transaction, Address } from '../types/api'

export interface APIResp<T> {
  data: T
  status: number
  detail: string
}

export class AlephClient {
  url: string
  fetchAPI: <T>(path: string) => Promise<APIResp<T>>

  constructor(url: string) {
    this.url = url
    this.fetchAPI = async function <T>(path: string) {
      const resp = await fetch(url + path)

      return new Promise((resolve) => {
        resp.json().then((r) => resolve({ data: r as T, detail: r.detail, status: resp.status }))
      }) as Promise<APIResp<T>>
    }
  }

  async block(id: string) {
    return await this.fetchAPI<BlockDetail>('/blocks/' + id)
  }

  async blocks(fromTs: number, toTs: number) {
    return await this.fetchAPI<Block[]>('/blocks?from-ts=' + fromTs + '&to-ts=' + toTs)
  }

  async address(id: string) {
    return await this.fetchAPI<Address>('/addresses/' + id)
  }

  async transaction(id: string) {
    return await this.fetchAPI<Transaction>('/transactions/' + id)
  }
}
