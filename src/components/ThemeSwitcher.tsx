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
  return theme === buttonTheme ? (theme === 'dark' ? '#F6C76A' : 'white') : '#646775'
}

const toggleWidth = 70
const toggleHeight = 35
const toggleIndicatorSize = toggleWidth / 2

const toggleVariants = {
  light: { left: 0, backgroundColor: '#F6C76A' },
  dark: { left: toggleWidth - toggleIndicatorSize, backgroundColor: '#3A0595' }
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, switchTheme }) => (
  <Toggle onClick={() => switchTheme(currentTheme === 'light' ? 'dark' : 'light')}>
    <ToggleContent>
      <ToggleIcon>
        <Sun onClick={() => switchTheme('light')} color={getButtonColor(currentTheme, 'light')} size={18} />
      </ToggleIcon>
      <ToggleIcon>
        <Moon onClick={() => switchTheme('dark')} color={getButtonColor(currentTheme, 'dark')} size={18} />
      </ToggleIcon>
    </ToggleContent>
    <ToggleFloatingIndicator
      variants={toggleVariants}
      animate={currentTheme}
      transition={{ duration: 0.5, type: 'spring' }}
    />
  </Toggle>
)

const Toggle = styled.div`
  position: absolute;
  width: ${toggleWidth}px;
  height: ${toggleHeight}px;
  top: 20px;
  right: 5vw;
  border: 2px solid ${({ theme }) => theme.borderPrimary};
  border-radius: 60px;
  background-color: ${({ theme }) => theme.bgSecondary};
  cursor: pointer;
  box-sizing: content-box;

  svg {
    cursor: pointer;
  }
`

const ToggleContent = styled.div`
  position: absolute;
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0;
  z-index: 1;
`

const ToggleIcon = styled.div`
  display: flex;
  flex: 1;

  * {
    margin: auto;
  }
`

const ToggleFloatingIndicator = styled(motion.div)`
  position: absolute;
  width: ${toggleIndicatorSize}px;
  height: ${toggleIndicatorSize}px;
  background-color: ${({ theme }) => theme.textPrimary};
  border-radius: 60px;
  z-index: 0;
`

export default ThemeSwitcher
