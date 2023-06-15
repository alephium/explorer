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
import { createContext, useContext, useEffect, useState } from 'react'

import useStateWithLocalStorage from '@/hooks/useStateWithLocalStorage'
import { ThemeType } from '@/styles/themes'
import { OnOff } from '@/types/generics'
import { SnackbarMessage } from '@/types/ui'

export interface GlobalContextInterface {
  timestampPrecisionMode: OnOff
  snackbarMessage: SnackbarMessage | undefined
  setSnackbarMessage: (message?: SnackbarMessage) => void
  setTimestampPrecisionMode: (status: OnOff) => void
}

export const GlobalContext = createContext<GlobalContextInterface>({
  snackbarMessage: undefined,
  setSnackbarMessage: () => null,
  timestampPrecisionMode: 'off',
  setTimestampPrecisionMode: () => null
})

export const GlobalContextProvider: FC = ({ children }) => {
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [timestampPrecisionMode, setTimestampPrecisionMode] = useStateWithLocalStorage<OnOff>(
    'timestampPrecisionMode',
    'off'
  )

  // Remove snackbar popup
  useEffect(() => {
    // Use a negative duration to make the snackbarMessage stay
    if (snackbarMessage && (!snackbarMessage.duration || snackbarMessage.duration > 0)) {
      setTimeout(() => setSnackbarMessage(undefined), snackbarMessage.duration || 3000)
    }
  }, [snackbarMessage])

  return (
    <GlobalContext.Provider
      value={{
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
