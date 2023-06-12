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

import { Clients } from '@/contexts/global'
import { AddressAssetsResult, AddressHash } from '@/types/addresses'
import { NetworkType } from '@/types/network'
import { getAssetMetadata } from '@/utils/assets'

export const fetchAddressAssets = async (
  clients: Clients,
  addressHash: AddressHash,
  networkType: NetworkType
): Promise<AddressAssetsResult> => {
  try {
    const tokenIds = await clients.explorer.addresses.getAddressesAddressTokens(addressHash)

    const tokens = await Promise.all(
      tokenIds.map(async (id) => {
        const tokenWithBalance = await clients.explorer.addresses.getAddressesAddressTokensTokenIdBalance(
          addressHash,
          id
        )
        const tokenMetadata = await getAssetMetadata({ assetId: id, networkType, nodeClient: clients.node })

        return {
          ...tokenWithBalance,
          ...tokenMetadata
        }
      })
    )

    return {
      addressHash,
      assets: tokens
    }
  } catch (e) {
    console.error(e)
    throw new Error(e as string)
  }
}
