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
    <Moon onClick={() => switchTheme('dark')} color={getButtonColor(currentTheme, 'dark')} />
    <Sun onClick={() => switchTheme('light')} color={getButtonColor(currentTheme, 'light')} />
  </Toggle>
)

const Toggle = styled.button`
  display: flex;
  border: 1px solid;
  height: 30px;
  width: 60px;
  border-radius: 30px;

  > :first-child{
    margin-right: 5px;
  }
`

export default ThemeSwitcher