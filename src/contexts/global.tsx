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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExplorerClient } from '@alephium/sdk'
import { createContext, FC, useContext, useEffect, useState } from 'react'

import useStateWithLocalStorage from '@/hooks/useStateWithLocalStorage'
import { ThemeType } from '@/styles/themes'
import { OnOff } from '@/types/generics'
import { NetworkType, networkTypes } from '@/types/network'
import { SnackbarMessage } from '@/types/ui'

interface GlobalContextInterface {
  client: ExplorerClient | undefined
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
  networkType: undefined,
  currentTheme: 'light',
  switchTheme: () => null,
  snackbarMessage: undefined,
  setSnackbarMessage: () => null,
  timestampPrecisionMode: 'off',
  setTimestampPrecisionMode: () => null
})

export const GlobalContextProvider: FC = ({ children }) => {
  const [themeName, setThemeName] = useStateWithLocalStorage<ThemeType>('theme', 'light')
  const [client, setClient] = useState<ExplorerClient>()
  const [networkType, setNetworkType] = useState<NetworkType>()
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [timestampPrecisionMode, setTimestampPrecisionMode] = useStateWithLocalStorage<OnOff>(
    'timestampPrecisionMode',
    'off'
  )

  useEffect(() => {
    // Check and apply environment variables
    let url: string | null | undefined = (window as any).VITE_BACKEND_URL

    let netType = (window as any).VITE_NETWORK_TYPE as NetworkType | undefined

    if (!url) {
      url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9090'
      netType = (import.meta.env.VITE_NETWORK_TYPE || 'testnet') as NetworkType

      console.info(`
        • DEVELOPMENT MODE •

        Using local env. variables if available. 
        You can set them using a .env file placed at the project's root.

        - Backend URL: ${url}
        - Network Type: ${netType}
      `)
    }

    if (!url) {
      throw new Error('The VITE_BACKEND_URL environment variable must be defined')
    }

    if (!netType) {
      throw new Error('The VITE_NETWORK_TYPE environment variable must be defined')
    } else if (!networkTypes.includes(netType)) {
      throw new Error('Value of the VITE_NETWORK_TYPE environment variable is invalid')
    }

    try {
      setClient(new ExplorerClient({ baseUrl: url }))
    } catch (error) {
      throw new Error('Could not create explorer client')
    }

    setNetworkType(netType)
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
