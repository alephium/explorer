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

import { ListBlocks } from '@alephium/sdk/api/explorer'
import { useCallback, useEffect, useState } from 'react'

import { useGlobalContext } from '../../contexts/global'

const useBlockListData = (currentPageNumber: number) => {
  const [blockList, setBlockList] = useState<ListBlocks>()
  const [manualLoading, setManualLoading] = useState(false)

  const { client } = useGlobalContext()

  const getBlocks = useCallback(
    async (pageNumber: number, manualFetch?: boolean) => {
      if (!client) return

      console.log('Fetching blocks...')

      manualFetch && setManualLoading(true)

      const { data } = await client.blocks.getBlocks({ page: pageNumber, limit: 10 })

      if (data) {
        console.log('Number of block fetched: ' + data.blocks?.length)
        setBlockList(data)
      }

      manualFetch && setManualLoading(false)
    },
    [client]
  )

  // Fetching Data when page number changes or page loads initially
  useEffect(() => {
    getBlocks(currentPageNumber, true)
  }, [getBlocks, currentPageNumber])

  return { getBlocks, blockPageLoading: manualLoading, data: { blockList } }
}

export default useBlockListData
