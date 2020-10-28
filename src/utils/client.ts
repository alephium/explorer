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

import { Block } from "../types/api";

export class AlephClient {
  host: string
  port: string
  fetchAPI: (arg0: string) => any

  constructor(host: string, port: string) {
    this.host = host
    this.port = port

    this.fetchAPI = async (path: string) => (await fetch('http://' + host + ':' + port + path)).json()
  }

  async block(id: string) {
    return await this.fetchAPI('/blocks/' + id);
  }

  async blocks(fromTs: number, toTs: number) {
    return await this.fetchAPI('/blocks?fromTs=' + fromTs + '&toTs=' + toTs) as Block[];
  }

  async address(id: string) {
    return await this.fetchAPI('/addresses/' + id);
  }

  async transaction(id: string) {
    return await this.fetchAPI('/transactions/' + id);
  }
}
