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
