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

import 'styled-components'

import { ThemeType } from './themes'

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    name: ThemeType
    body: string

    textPrimary: string
    textSecondary: string
    textTertiary: string
    textAccent: string

    link: string
    linkHighlight: string

    bgPrimary: string
    bgSecondary: string
    bgTertiary: string
    bgHighlight: string
    bgHover: string

    borderPrimary: string
    borderSecondary: string
    borderHighlight: string

    shadowPrimary: string
    shadowSecondary: string
    shadowTertiary: string

    accentGradient: string

    tooltip: string

    accent: string
    valid: string
    alert: string

    white: string
  }
}
