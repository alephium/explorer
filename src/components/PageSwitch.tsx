import React from 'react'
import { ChevronRight, ChevronLeft } from 'react-feather'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import useQueryParams from '../hooks/useQueryParams'
import { TextButton } from './Buttons'

const PageSwitch = () => {
  const page = parseInt(useQueryParams('p') || '1')
  const history = useHistory()
  const location = history.location

  const handlePageSwitch = (direction: 'previous' | 'next') => {
    const newSearch = new URLSearchParams(location.search)

    newSearch.set('p', direction === 'previous' ? (page - 1).toString() : (page + 1).toString())

    history.push({ search: newSearch.toString() })
  }

  return (
    <SwitchContainer>
      <TextButton style={{ marginRight: 20 }} disabled={page === 1} onClick={() => handlePageSwitch('previous')}>
        <ChevronLeft />
        <span>Previous</span>
      </TextButton>
      <TextButton onClick={() => handlePageSwitch('next')}>
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
export default PageSwitch
