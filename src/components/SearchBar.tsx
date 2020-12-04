// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { Search } from 'react-feather'

const SearchBar = () => {
  const [active, setActive] = useState(false)
  const [search, setSearch] = useState('')

  const history = useHistory()

  const handleInputClick = () => setActive(true)

  const handleBackdropClick = () => setActive(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearchClick = () => searching(search)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searching(search)
    }
  }

  const cleanSearch = () => {
    setSearch('')
    setActive(false)
  }

  const redirect = (to: string) => {
    cleanSearch()
    history.push(to)
  }

  const searching = (str: string) => {
    const word = str.trim()
    //TODO This is a very dummy way do differentiate address and transaction, need improvement
    if (word.charAt(0) === 'T' || word.charAt(0) === 'M' || word.charAt(0) === 'D') {
      redirect(`/addresses/${word}`)
    } else if (word.length === 64) {
      redirect(`/transactions/${word}`)
    } else {
      cleanSearch()
    }
  }

  return (
    <Container>
      <div>
        <SearchInput
          onChange={handleSearchChange}
          value={search}
          onClick={handleInputClick}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search for an address or a tx..."
        />
        <SearchIcon onClick={handleSearchClick} />
      </div>
      {active && <Backdrop onClick={handleBackdropClick} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} />}
    </Container>
  )
}

const Container = styled.div`
  position: relative;
`

const SearchIcon = styled(Search)`
  color: ${({ theme }) => theme.textPrimary};
  position: absolute;
  right: 20px;
  top: 12px;
  z-index: 11;
`

const SearchInput = styled.input`
  position: absolute;
  width: 100%;
  height: 50px;
  border-radius: 30px;
  padding: 0 20px;
  color: ${({ theme }) => theme.textPrimary};
  background: ${({ theme }) => theme.bgSecondary};
  border: 2px solid ${({ theme }) => theme.borderPrimary};
  transition: all 0.15s ease-out;

  &:hover {
    border: 2px solid ${({ theme }) => theme.borderHighlight};
  }

  &:focus,
  &:active {
    box-shadow: 0 15px 15px rgba(0, 0, 0, 0.15);
    background: linear-gradient(${({ theme }) => `${theme.bgSecondary}, ${theme.bgSecondary}`}) padding-box,
      /*this is your grey background*/ linear-gradient(to right, #6510f7, #f76110) border-box;
    border: 2px solid transparent;
    z-index: 10;
  }
`

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9;
  opacity: 0;
`

export default SearchBar
