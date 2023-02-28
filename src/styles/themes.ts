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

import { DefaultTheme } from 'styled-components'

export type ThemeType = 'light' | 'dark'

export const darkTheme: DefaultTheme = {
  name: 'dark',
  body: '#141417',

  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textTertiary: 'rgba(255, 255, 255, 0.45)',
  textAccent: '#EFA25B',

  link: '#53A9F5',
  linkHighlight: '#0E82E7',

  bgPrimary: '#1B1B1F',
  bgSecondary: '#141417',
  bgTertiary: '#09090b',
  bgHighlight: 'rgba(255, 255, 255, 0.04)',
  bgHover: 'rgb(255, 255, 255, 0.03)',

  borderPrimary: 'rgb(43, 43, 48)',
  borderSecondary: 'rgba(255, 255, 255, 0.04)',
  borderHighlight: '#585962',

  shadowPrimary: '0 5px 5px rgba(0, 0, 0, 0.35)',
  shadowSecondary: '0 4px 10px rgba(0, 0, 0, 0.3)',
  shadowTertiary: '0 5px 20px rgba(0, 0, 0, 0.50)',

  accentGradient: 'linear-gradient(200deg, #F46016 60%, #D333EE 100%) border-box',

  tooltip: '#000000',

  accent: '#6083ff',
  valid: 'rgb(93, 203, 126)',
  alert: 'rgb(243, 113, 93)',

  white: '#ffffff'
}

export const lightTheme: DefaultTheme = {
  name: 'light',
  body: '#f3f3f3',

  textPrimary: 'rgba(15, 15, 15, 0.95)',
  textSecondary: 'rgba(15, 15, 15, 0.70)',
  textTertiary: 'rgba(15, 15, 15, 0.60)',
  textAccent: '#e69100',

  link: '#0E82E7',
  linkHighlight: '#53A9F5',

  bgPrimary: '#ffffff',
  bgSecondary: '#f3f3f3',
  bgTertiary: '#eeeeee',
  bgHighlight: 'rgba(0, 0, 0, 0.02)',
  bgHover: 'rgba(0, 0, 0, 0.015)',

  borderPrimary: '#e4e4e4',
  borderSecondary: 'rgba(36, 34, 32, 0.07)',
  borderHighlight: '#D1D1D4',

  shadowPrimary: '0 5px 5px rgba(0, 0, 0, 0.2)',
  shadowSecondary: '0 4px 7px rgba(0, 0, 0, 0.15)',
  shadowTertiary: '0 5px 20px rgba(0, 0, 0, 0.08)',

  accentGradient: 'linear-gradient(200deg, #F46016 60%, #D333EE 100%) border-box',

  tooltip: '#000000',

  accent: '#6083ff',
  valid: 'rgb(93, 203, 126)',
  alert: 'rgb(243, 113, 93)',

  white: '#ffffff'
}
