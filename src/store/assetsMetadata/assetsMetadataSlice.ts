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

import { ALPH } from '@alephium/token-list'
import { createSlice, EntityState } from '@reduxjs/toolkit'

import { FungibleTokenMetadataStored, NFTMetadataStored } from '@/types/assets'

import { syncUnknownAssetsInfo } from './assetsMetadataActions'
import { fungibleTokensMetadataAdapter, nftsMetadataAdapter } from './assetsMetadataAdapter'

interface AssetMetadataState {
  fungibleTokens: EntityState<FungibleTokenMetadataStored>
  nfts: EntityState<NFTMetadataStored>
}

const initialState: AssetMetadataState = {
  fungibleTokens: fungibleTokensMetadataAdapter.addOne(fungibleTokensMetadataAdapter.getInitialState(), {
    ...ALPH,
    verified: true
  }),
  nfts: nftsMetadataAdapter.getInitialState()
}

const assetsSlice = createSlice({
  name: 'assetsInfo',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(syncUnknownAssetsInfo.fulfilled, (state, action) => {
      const metadata = action.payload

      if (!metadata) return

      fungibleTokensMetadataAdapter.upsertMany(state.fungibleTokens, metadata.fungibleTokens)
      nftsMetadataAdapter.upsertMany(state.nfts, metadata.nfts)
    })
  }
})

export default assetsSlice
