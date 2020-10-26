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

import React from 'react'
import styled from 'styled-components'
import { Moon, Sun } from 'react-feather'
import { ThemeType } from '../style/themes'

interface ThemeSwitcherProps {
  currentTheme: ThemeType
  switchTheme: (arg0: ThemeType) => void
}

const getButtonColor = (theme: ThemeType, buttonTheme: string) => {
  return theme === buttonTheme ? '#F6C76A' : '#646775'
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, switchTheme }) => (
  <Toggle>
    <Sun onClick={() => switchTheme('light')} color={getButtonColor(currentTheme, 'light')} size={20} />
    <Moon onClick={() => switchTheme('dark')} color={getButtonColor(currentTheme, 'dark')} size={20} />
  </Toggle>
)

const Toggle = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  border: 2px solid ${({ theme }) => theme.borderPrimary };
  border-radius: 30px;
  padding: 0 5px;
  background-color: ${({ theme }) => theme.bgSecondary};

  > :first-child{
    margin-right: 5px;
  }

  svg {
    padding: 5px;
    cursor: pointer;
  }
`

export default ThemeSwitcher