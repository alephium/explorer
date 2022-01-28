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

import { ExplorerClient } from 'alephium-js'

import { ThemeType } from '../style/themes'
import { AlephClient } from '../utils/client'
import { OnOff } from './generics'
import { NetworkType } from './network'
import { SidebarState, SnackbarMessage } from './ui'

export interface GlobalContextInterface {
  client: AlephClient | undefined
  explorerClient: ExplorerClient | undefined
  networkType: NetworkType | undefined
  currentTheme: ThemeType
  sidebarState: 'open' | 'close'
  setSidebarState: (state: SidebarState) => void
  switchTheme: (arg0: ThemeType) => void
  setSnackbarMessage: (message: SnackbarMessage) => void
  timestampPrecisionMode: OnOff
  setTimestampPrecisionMode: (status: OnOff) => void
}
