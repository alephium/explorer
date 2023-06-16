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

import { AssetInfo } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { hexToString } from '@alephium/web3'
import { createSlice, EntityState } from '@reduxjs/toolkit'

import { syncNetworkTokensInfo, syncUnknownTokensInfo } from './assetsActions'
import { assetsInfoAdapter } from './assetsAdapter'

const initialState: EntityState<AssetInfo> = assetsInfoAdapter.addOne(assetsInfoAdapter.getInitialState(), {
  ...ALPH,
  verified: true
})

const assetsSlice = createSlice({
  name: 'assetsInfo',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncNetworkTokensInfo.fulfilled, (state, action) => {
        const metadata = action.payload

        if (metadata) {
          assetsInfoAdapter.upsertMany(
            state,
            metadata.tokens.map((tokenInfo) => ({
              ...tokenInfo,
              verified: true
            }))
          )
        }
      })
      .addCase(syncUnknownTokensInfo.fulfilled, (state, action) => {
        const metadata = action.payload

        if (metadata) {
          assetsInfoAdapter.upsertMany(
            state,
            metadata.map((token) => ({
              id: token.id,
              name: hexToString(token.name),
              symbol: hexToString(token.symbol),
              decimals: token.decimals,
              verified: false
            }))
          )
        }
      })
  }
})

export default assetsSlice