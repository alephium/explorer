import React, { useCallback, useEffect, useMemo } from 'react'
import { ChevronRight, ChevronLeft } from 'react-feather'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import useQueryParams from '../hooks/useQueryParams'
import { TextButton } from './Buttons'

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
  margin-top: 35px;
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
