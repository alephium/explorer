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

export interface APIData<T> {
  data: T
  status: number
  resource?: never
  detail?: never
}

export interface APIError {
  status: number
  detail: string
  resource?: string
  data?: never
}

export type APIResp<T> = APIData<T> | APIError

export class AlephClient {
  url: string
  fetchAPI: <T>(path: string) => Promise<APIResp<T>>

  constructor(url: string) {
    this.url = url
    this.fetchAPI = async function <T>(path: string) {
      return fetch(url + path)
        .then((resp) => {
          return new Promise((resolve, reject) => {
            if (resp.ok) {
              resp.json().then((r) => resolve({ data: r as T, status: resp.status }))
            } else {
              resp.json().then((e) => {
                return reject({ detail: e.detail, status: resp.status, resource: e.resource } as APIError)
              })
            }
          }) as Promise<APIResp<T>>
        })
        .catch((e) => {
          return e as APIError
        })
    }
  }

  async block(id: string, page: number) {
    return await this.fetchAPI<BlockDetail>('/blocks/' + id + '?page=' + page)
  }

  async blocks(page: number) {
    return await this.fetchAPI<Block[]>('/blocks?page=' + page)
  }

  async address(id: string) {
    return await this.fetchAPI<Address>('/addresses/' + id)
  }

  async addressTransactions(id: string, page: number) {
    return await this.fetchAPI<Transaction[]>('/addresses/' + id + '/transactions' + '?page=' + page)
  }

  async transaction(id: string) {
    return await this.fetchAPI<Transaction>('/transactions/' + id)
  }
}
