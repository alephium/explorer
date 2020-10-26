import { DefaultTheme } from "styled-components"

export type ThemeType = 'light' | 'dark'

export const darkTheme: DefaultTheme = {
  name: 'dark',
  body: '#212126',

  textPrimary: 'rgba(255, 255, 255, 0.8)',
  textSecondary: 'rgba(255, 255, 255, 0.35)',

  bgPrimary: '#212126',
  bgSecondary: '#18191C',

  borderPrimary: '#34353A',
  borderHighlight: '#585962'
}

export const lightTheme: DefaultTheme = {
  name: 'light',
  body: 'white',
  
  textPrimary: 'rgba(15, 15, 15, 0.95)',
  textSecondary: 'rgba(15, 15, 15, 0.50)',

  bgPrimary: 'white',
  bgSecondary: '#FAFAFA',

  borderPrimary: '#F2F2F3',
  borderHighlight: '#D1D1D4'
}

