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
  textAccent: '#EFA25B',

  link: '#53A9F5',
  linkHighlight: '#0E82E7',

  bgPrimary: '#19191E',
  bgSecondary: '#141417',
  bgTertiary: '#101012',
  bgHighlight: 'rgba(255, 255, 255, 0.03)',
  bgHover: 'rgb(28, 28, 33)',

  borderPrimary: 'rgb(43, 43, 48)',
  borderSecondary: 'rgb(34, 34, 38)',
  borderHighlight: '#585962',

  shadowPrimary: '0 5px 10px rgba(0, 0, 0, 0.3)',
  shadowSecondary: '0 5px 5px rgba(0, 0, 0, 0.15)',
  shadowTertiary: '0 0px 10px rgba(0, 0, 0, 0.1)',

  accentGradient: 'linear-gradient(200deg, #F46016 60%, #D333EE 100%) border-box',

  tooltip: '#000000',

  valid: 'rgb(93, 203, 126)',
  alert: 'rgb(243, 113, 93)'
}

export const lightTheme: DefaultTheme = {
  name: 'light',
  body: '#f3f3f3',

  textPrimary: 'rgba(15, 15, 15, 0.95)',
  textSecondary: 'rgba(15, 15, 15, 0.50)',
  textAccent: '#e69100',

  link: '#0E82E7',
  linkHighlight: '#53A9F5',

  bgPrimary: '#ffffff',
  bgSecondary: '#f3f3f3',
  bgTertiary: '#eeeeee',
  bgHighlight: 'rgba(0, 0, 0, 0.015)',
  bgHover: 'rgba(0, 0, 0, 0.01)',

  borderPrimary: '#e4e4e4',
  borderSecondary: '#e5e5e5',
  borderHighlight: '#D1D1D4',

  shadowPrimary: '0 5px 10px rgba(0, 0, 0, 0.05)',
  shadowSecondary: '0 5px 5px rgba(0, 0, 0, 0.04)',
  shadowTertiary: '0 0px 10px rgba(0, 0, 0, 0.01)',

  accentGradient: 'linear-gradient(200deg, #F46016 60%, #D333EE 100%) border-box',

  tooltip: '#000000',

  valid: 'rgb(93, 203, 126)',
  alert: 'rgb(243, 113, 93)'
}
