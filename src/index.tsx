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

import './index.css'

import { ExplorerClient } from 'alephium-js'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Redirect, Route } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'

import AppFooter from './components/AppFooter'
import AppHeader from './components/AppHeader'
import NotificationBar from './components/NotificationBar'
import { StyledThemeSwitcher } from './components/ThemeSwitcher'
import AddressInfoSection from './sections/AddressInfoSection'
import AddressesSection from './sections/AdressesSection'
import BlockInfoSection from './sections/BlockInfoSection'
import BlockSection from './sections/BlockSection'
import TransactionInfoSection from './sections/TransactionInfoSection'
import TransactionsSection from './sections/TransactionsSection'
import * as serviceWorker from './serviceWorker'
import GlobalStyle, { deviceBreakPoints } from './style/globalStyles'
import { darkTheme, lightTheme, ThemeType } from './style/themes'
import { GlobalContextInterface } from './types/context'
import { OnOff } from './types/generics'
import { NetworkType, networkTypes } from './types/network'
import { SidebarState, SnackbarMessage } from './types/ui'
import { AlephClient, createClient } from './utils/client'
import { useStateWithLocalStorage } from './utils/hooks'
import { ScrollToTop } from './utils/routing'

export const GlobalContext = React.createContext<GlobalContextInterface>({
  client: undefined,
  explorerClient: undefined,
  networkType: undefined,
  currentTheme: 'dark',
  sidebarState: 'open',
  setSidebarState: () => null,
  switchTheme: () => null,
  setSnackbarMessage: () => null,
  timestampPrecisionMode: 'off',
  setTimestampPrecisionMode: () => null
})

/* Customize data format accross the app */
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'A few secs',
    m: 'A min',
    mm: '%d mins',
    h: 'An hour',
    hh: '%d hours',
    d: 'A day',
    dd: '%d days',
    M: 'A month',
    MM: '%d months',
    y: 'A year',
    yy: '%d years'
  }
})

const App = () => {
  const [themeName, setThemeName] = useStateWithLocalStorage<ThemeType>('theme', 'dark')
  const [client, setClient] = useState<AlephClient>()
  const [explorerClient, setExplorerClient] = useState<ExplorerClient>()
  const [networkType, setNetworkType] = useState<NetworkType>()
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [sidebarState, setSidebarState] = useState<SidebarState>('close')
  const [timestampPrecisionMode, setTimestampPrecisionMode] = useStateWithLocalStorage<OnOff>(
    'timestampPrecisionMode',
    'off'
  )

  const contentRef = useRef(null)

  const getContentRef = useCallback(() => contentRef.current, [])
  const history = useHistory()

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
    <Router>
      <ThemeProvider theme={themeName === 'light' ? lightTheme : darkTheme}>
        <GlobalStyle />
        <GlobalContext.Provider
          value={{
            client,
            explorerClient,
            networkType,
            currentTheme: themeName as ThemeType,
            switchTheme: setThemeName as (arg0: ThemeType) => void,
            sidebarState: 'close',
            setSidebarState: setSidebarState,
            setSnackbarMessage,
            timestampPrecisionMode,
            setTimestampPrecisionMode
          }}
        >
          <MainContainer>
            <AppHeader />
            <ContentContainer>
              <ContentWrapper ref={contentRef}>
                <ScrollToTop getScrollContainer={getContentRef} />

                <Content>
                  <Route exact path="/">
                    <Redirect to="/blocks" />
                  </Route>
                  <Route exact path="/blocks">
                    <BlockSection />
                  </Route>
                  <Route path="/blocks/:id">
                    <BlockInfoSection />
                  </Route>
                  <Route exact path="/addresses">
                    <AddressesSection />
                  </Route>
                  <Route path="/addresses/:id">
                    <AddressInfoSection />
                  </Route>
                  <Route exact path="/transactions">
                    <TransactionsSection />
                  </Route>
                  <Route path="/transactions/:id">
                    <TransactionInfoSection />
                  </Route>
                </Content>
              </ContentWrapper>
            </ContentContainer>
            <AppFooter />
            <SnackbarManager message={snackbarMessage} />
          </MainContainer>
        </GlobalContext.Provider>
      </ThemeProvider>
    </Router>
  )
}

const SnackbarManager = ({ message }: { message: SnackbarMessage | undefined }) => {
  return (
    <SnackbarManagerContainer>
      <AnimatePresence>
        {message && (
          <SnackbarPopup
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={message?.type}
          >
            {message?.text}
          </SnackbarPopup>
        )}
      </AnimatePresence>
    </SnackbarManagerContainer>
  )
}

const MainContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
`

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 25px;
`

const ContentWrapper = styled.main`
  min-height: 100%;
  flex: 1 1 1200px;
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 1400px;

  @media ${deviceBreakPoints.mobile} {
    width: 100%;
    justify-self: flex-start;
  }
`

const Content = styled.div`
  flex: 1;
  display: flex;
  padding: 0 min(5vw, 50px);
  margin-top: 20px;
  margin-bottom: 40px;
`

const HamburgerButton = styled.div`
  width: 35px;
  height: 35px;
  display: none;
  margin-right: 15px;

  @media ${deviceBreakPoints.tablet} {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  @media ${deviceBreakPoints.mobile} {
    margin-right: 5px;
  }
`

const SnackbarManagerContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  z-index: 10001;
`

const SnackbarPopup = styled(motion.div)`
  bottom: 10px;
  left: 25px;
  margin: 10px auto;
  text-align: center;
  min-width: 150px;
  max-width: 50vw;
  padding: 20px;
  color: white;
  border-radius: 14px;
  z-index: 1000;

  &.alert {
    background-color: rgb(219, 99, 69);
  }

  &.info {
    background-color: black;
  }

  &.success {
    background-color: rgb(56, 168, 93);
  }
`

let browserIsOld = false

try {
  BigInt(1)
} catch {
  browserIsOld = true
}

ReactDOM.render(
  <Router>
    {!browserIsOld ? (
      <App />
    ) : (
      <NotificationBar>
        Your browser version appears to be out of date. To use our app, please update your browser.
      </NotificationBar>
    )}
  </Router>,
  document.getElementById('root')
)

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
