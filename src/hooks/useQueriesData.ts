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

import { QueryKey, useQueries, UseQueryOptions } from '@tanstack/react-query'
import { reduce, some } from 'lodash'

export const useQueriesData = <TQueryFnData, TError, TData, TQueryKey extends QueryKey>(
  queries: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>[]
) =>
  reduce(
    useQueries({ queries }),
    (acc, r) => ({
      data: [...acc.data, r.data].filter((data): data is NonNullable<TQueryFnData> => data !== undefined),
      loadingArray: [...acc.loadingArray, r.isLoading],
      isLoading: some([acc.loadingArray, r.isLoading], (l) => l === true)
    }),
    { data: [] as NonNullable<TQueryFnData>[], loadingArray: [true], isLoading: true }
  )
