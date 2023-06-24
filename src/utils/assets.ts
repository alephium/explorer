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

import { groupBy, map, mapValues } from 'lodash'

import { AssetBase, AssetType } from '@/types/assets'

const assetTypeMap: Record<AssetType, string> = {
  fungible: 'fungibleTokenIds',
  'non-fungible': 'NFTIds',
  undefined: 'unknownAssetIds'
}

export const getCategorizedAssetIds = (assets?: AssetBase[]) => {
  // Use assetTypeMap to create an object with each key mapping to an empty array
  if (!assets) {
    return Object.fromEntries(Object.values(assetTypeMap).map((key) => [key, []]))
  }

  return mapValues(
    groupBy(assets, (asset) => assetTypeMap[asset.type]),
    (assetsGroup) => map(assetsGroup, 'id')
  )
}
