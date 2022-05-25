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
import { usePageVisibility } from 'react-page-visibility'

import { useGlobalContext } from '../../contexts/global'
import useInterval from '../../hooks/useInterval'
import usePageNumber from '../../hooks/usePageNumber'

const useBlockListData = () => {
  const [blockList, setBlockList] = useState<ListBlocks>()
  const [loading, setLoading] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)

  const isAppVisible = usePageVisibility()

  const { client } = useGlobalContext()

  // Default page
  const currentPageNumber = usePageNumber()

  const getBlocks = useCallback(
    async (pageNumber: number, manualFetch?: boolean) => {
      if (!client) return

      console.log('Fetching blocks...')

      manualFetch ? setManualLoading(true) : setLoading(true)
      const { data } = await client.blocks.getBlocks({ page: pageNumber, limit: 10 })

      // Check if manual fetching has been set in the meantime (overriding polling fetch)

      if (currentPageNumber !== pageNumber) {
        setLoading(false)
        return
      }

      if (data) {
        console.log('Number of block fetched: ' + data.blocks?.length)
        setBlockList(data)
      }

      manualFetch ? setManualLoading(false) : setLoading(false)
    },
    [client, currentPageNumber]
  )

  // Fetching Data when page number changes or page loads initially
  useEffect(() => {
    getBlocks(currentPageNumber, true)
  }, [getBlocks, currentPageNumber])

  // Polling
  useInterval(
    () => {
      if (currentPageNumber === 1 && !loading && !manualLoading) getBlocks(currentPageNumber)
    },
    10 * 1000,
    !isAppVisible
  )

  return { loading, manualLoading, data: { blockList } }
}

export default useBlockListData
