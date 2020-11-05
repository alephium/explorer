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
import { motion } from 'framer-motion'

interface ThemeSwitcherProps {
  currentTheme: ThemeType
  switchTheme: (arg0: ThemeType) => void
}

const getButtonColor = (theme: ThemeType, buttonTheme: string) => {
  return theme === buttonTheme ? '#F6C76A' : '#646775'
}

const toggleWidth = 70
const toggleHeight = 35
const toggleIndicatorSize = toggleHeight - 6

const toggleVariants = {
  light: { left: 2 },
  dark: { left: toggleWidth - toggleIndicatorSize - 6 },
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, switchTheme }) => (
  <Toggle onClick={() => switchTheme(currentTheme === 'light' ? 'dark' : 'light')}>
    <ToggleContent>
      <Sun onClick={() => switchTheme('light')} color={getButtonColor(currentTheme, 'light')} size={18} />
      <Moon onClick={() => switchTheme('dark')} color={getButtonColor(currentTheme, 'dark')} size={18} />
    </ToggleContent>
    <ToggleFloatingIndicator variants={toggleVariants} animate={currentTheme} />
  </Toggle>
)

const Toggle = styled.div`
  position: absolute;
  width: ${toggleWidth}px;
  height: ${toggleHeight}px;
  top: 20px;
  right: 5vw;
  border: 2px solid ${({ theme }) => theme.borderPrimary };
  border-radius: 60px;
  background-color: ${({ theme }) => theme.bgSecondary};
  cursor: pointer;

  svg {
    cursor: pointer;
  }
`

const ToggleContent = styled.div`
  position: absolute;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 0 7px;
  z-index: 1;
`

const ToggleFloatingIndicator = styled(motion.div)`
  position: absolute;
  width: ${toggleIndicatorSize}px;
  height: ${toggleIndicatorSize}px;
  background-color: ${({theme}) => theme.textPrimary };
  border-radius: 60px;
  z-index: 0;
  top: 1px;
`

export default ThemeSwitcher