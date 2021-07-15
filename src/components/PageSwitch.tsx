import React from 'react'
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
  // NOTA BENE // TODO: numberOfElementsLoaded is a temporary solution to guess if we're at the end of the list.
  // This will be removed as soon as the backend is ready

  const currentPage = parseInt(useQueryParams('p') || '1')
  const history = useHistory()
  const location = history.location

  const locationSearch = new URLSearchParams(location.search)

  const handlePageSwitch = (direction: 'previous' | 'next') => {
    locationSearch.set('p', direction === 'previous' ? (currentPage - 1).toString() : (currentPage + 1).toString())

    history.push({ search: locationSearch.toString() })
  }

  const totalNumberOfPages = totalNumberOfElements && Math.ceil(totalNumberOfElements / elementsPerPage)

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
