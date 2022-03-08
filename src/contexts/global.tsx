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
import { createContext, FC, useContext, useEffect, useState } from 'react'

import { ThemeType } from '../style/themes'
import { OnOff } from '../types/generics'
import { NetworkType, networkTypes } from '../types/network'
import { SnackbarMessage } from '../types/ui'
import { AlephClient, createClient } from '../utils/client'
import { useStateWithLocalStorage } from '../utils/hooks'

interface GlobalContextInterface {
  client: AlephClient | undefined
  explorerClient: ExplorerClient | undefined
  networkType: NetworkType | undefined
  currentTheme: ThemeType
  switchTheme: (arg0: ThemeType) => void
  snackbarMessage: SnackbarMessage | undefined
  setSnackbarMessage: (message: SnackbarMessage) => void
  timestampPrecisionMode: OnOff
  setTimestampPrecisionMode: (status: OnOff) => void
}

export const GlobalContext = createContext<GlobalContextInterface>({
  client: undefined,
  explorerClient: undefined,
  networkType: undefined,
  currentTheme: 'dark',
  switchTheme: () => null,
  snackbarMessage: undefined,
  setSnackbarMessage: () => null,
  timestampPrecisionMode: 'off',
  setTimestampPrecisionMode: () => null
})

export const GlobalContextProvider: FC = ({ children }) => {
  const [themeName, setThemeName] = useStateWithLocalStorage<ThemeType>('theme', 'dark')
  const [client, setClient] = useState<AlephClient>()
  const [explorerClient, setExplorerClient] = useState<ExplorerClient>()
  const [networkType, setNetworkType] = useState<NetworkType>()
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [timestampPrecisionMode, setTimestampPrecisionMode] = useStateWithLocalStorage<OnOff>(
    'timestampPrecisionMode',
    'off'
  )

  useEffect(() => {
    // Check and apply environment variables
    const url: string | null | undefined = process.env.REACT_APP_BACKEND_URL
    const networkType = process.env.REACT_APP_NETWORK_TYPE as NetworkType | undefined

    if (!url) {
      throw new Error('The REACT_APP_BACKEND_URL environment variable must be defined')
    }

    if (!networkType) {
      throw new Error('The REACT_APP_NETWORK_TYPE environment variable must be defined')
    } else if (!networkTypes.includes(networkType)) {
      throw new Error('Value of the REACT_APP_NETWORK_TYPE environment variable is invalid')
    }

    try {
      setExplorerClient(new ExplorerClient({ baseUrl: url }))
    } catch (error) {
      throw new Error('Could not create explorer client')
    }

    setClient(createClient(url))
    setNetworkType(networkType)
  }, [])

  // Remove snackbar popup
  useEffect(() => {
    if (snackbarMessage) {
      setTimeout(() => setSnackbarMessage(undefined), snackbarMessage.duration || 3000)
    }
  }, [snackbarMessage])

  return (
    <GlobalContext.Provider
      value={{
        client,
        explorerClient,
        networkType,
        currentTheme: themeName as ThemeType,
        switchTheme: setThemeName as (arg0: ThemeType) => void,
        snackbarMessage,
        setSnackbarMessage,
        timestampPrecisionMode,
        setTimestampPrecisionMode
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
