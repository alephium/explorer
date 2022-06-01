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

import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import { deviceBreakPoints } from '../style/globalStyles'
import { checkAddressValidity, checkHexStringValidity } from '../utils/strings'

interface SearchBarProps {
  className?: string
}

const SearchBar = ({ className }: SearchBarProps) => {
  const [active, setActive] = useState(false)
  const [search, setSearch] = useState('')
  const { setSnackbarMessage } = useGlobalContext()
  const inputRef = useRef<HTMLInputElement>(null)

  const history = useHistory()

  const handleInputClick = () => setActive(true)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearchClick = () => searching(search)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searching(search)
    }
  }

  const handleRemoveFocus = () => {
    setActive(false)
  }

  const cleanSearch = () => {
    setSearch('')
    setActive(false)
  }

  const redirect = (to: string) => {
    handleRemoveFocus()
    cleanSearch()
    inputRef.current?.blur()
    history.push(to)
  }

  const searching = (str: string) => {
    const word = str.trim()

    const isHexString = checkHexStringValidity(word)

    //TODO This is a very dummy way do differentiate address and transaction, need improvement
    if (isHexString) {
      // Is probably not an address, as an address usually contains at least one non-hex character.
      if (word.length === 64) {
        if (word.slice(0, 4) === '0000') {
          redirect(`/blocks/${word}`)
        } else {
          redirect(`/transactions/${word}`)
        }
      } else {
        setSnackbarMessage({ text: 'There seems to be an error in the hash format.', type: 'info' })
      }
    } else {
      if (checkAddressValidity(word)) {
        redirect(`/addresses/${word}`)
      } else {
        setSnackbarMessage({ text: 'There seems to be an error in the address format.', type: 'info' })
      }
    }
  }

  return (
    <motion.div className={className} layoutId="searchBar">
      <SearchInput
        ref={inputRef}
        onBlur={handleRemoveFocus}
        onChange={handleSearchChange}
        value={search}
        onClick={handleInputClick}
        onKeyDown={handleSearchKeyDown}
        placeholder="Search for an address or a tx..."
      />
      {active && <Backdrop animate={{ opacity: 1 }} transition={{ duration: 0.15 }} />}
      <SearchIcon onClick={handleSearchClick} />
      <SearchBackdropGradient />
    </motion.div>
  )
}

export default styled(SearchBar)`
  position: relative;
  height: 45px;
`

const SearchIcon = styled(Search)`
  color: ${({ theme }) => theme.textPrimary};
  position: absolute;
  right: 20px;
  top: 12px;
  z-index: 11;
  height: 21px;
  cursor: pointer;
`

const SearchInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid ${({ theme }) => theme.borderPrimary};
  border-radius: 9px;
  padding: 0 20px;
  color: ${({ theme }) => theme.textPrimary};
  background-color: ${({ theme }) => theme.bgPrimary};
  z-index: 10;

  &:hover {
    box-shadow: inset 0px 0px 2px ${({ theme }) => theme.borderHighlight};
  }

  &:focus,
  &:active {
    box-shadow: ${({ theme }) => theme.shadowTertiary}, inset;
    background: linear-gradient(${({ theme }) => `${theme.bgSecondary}, ${theme.bgSecondary}`}) padding-box,
      ${({ theme }) => theme.accentGradient};
    border: 2px solid transparent;
    z-index: 10;
  }
`

const SearchBackdropGradient = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: radial-gradient(#169ff4 25%, #f46016 40%, #6510f8 60%);
  transform: scaleY(5) scaleX(2);
  filter: blur(10px) opacity(0.15);
  z-index: -1;
  border-radius: 100%;

  @media ${deviceBreakPoints.mobile} {
    display: none;
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
