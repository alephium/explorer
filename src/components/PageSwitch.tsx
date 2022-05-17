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

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import useQueryParams from '../hooks/useQueryParams'
import TextButton from './Buttons/TextButton'

const PageSwitch = ({
  elementsPerPage = 20,
  totalNumberOfElements,
  numberOfElementsLoaded
}: {
  elementsPerPage?: number
  totalNumberOfElements?: number
  numberOfElementsLoaded?: number
}) => {
  const currentPage = parseInt(useQueryParams('p') || '1')
  const history = useHistory()
  const location = history.location

  const locationSearch = useMemo(() => new URLSearchParams(location.search), [location.search])

  const handlePageSwitch = (direction: 'previous' | 'next') => {
    setPageNumber(direction === 'previous' ? currentPage - 1 : currentPage + 1)
  }

  const setPageNumber = useCallback(
    (pageNumber: number) => {
      locationSearch.set('p', pageNumber.toString())
      history.push({ search: locationSearch.toString() })
    },
    [history, locationSearch]
  )

  const totalNumberOfPages = totalNumberOfElements && Math.ceil(totalNumberOfElements / elementsPerPage)

  // Redirect if page number is incorrect
  useEffect(() => {
    if (currentPage < 1) {
      setPageNumber(1)
    } else if (totalNumberOfPages && currentPage > totalNumberOfPages) {
      setPageNumber(totalNumberOfPages)
    } else if (isNaN(currentPage)) {
      setPageNumber(1)
    }
  }, [currentPage, setPageNumber, totalNumberOfPages])

  if (totalNumberOfElements === 0) return null

  return (
    <SwitchContainer>
      <TextButton disabled={currentPage === 1} onClick={() => handlePageSwitch('previous')}>
        <ChevronLeft />
        <span>Previous</span>
      </TextButton>
      <PageNumbers>
        {currentPage}
        {totalNumberOfPages && <TotalNumberOfPages>{` / ${totalNumberOfPages}`}</TotalNumberOfPages>}
      </PageNumbers>
      <TextButton
        disabled={
          totalNumberOfPages
            ? totalNumberOfPages === currentPage
            : numberOfElementsLoaded
            ? numberOfElementsLoaded < 20
            : false
        }
        onClick={() => handlePageSwitch('next')}
      >
        <span>Next</span>
        <ChevronRight />
      </TextButton>
    </SwitchContainer>
  )
}

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 25px;
`

const PageNumbers = styled.div`
  padding: 0 15px;
  text-align: center;
  font-weight: 600;
`

const TotalNumberOfPages = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`

export default PageSwitch
