// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { HashRouter as Router, Redirect, Route } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme, ThemeType } from './style/themes'
import GlobalStyle from './style/globalStyles'
import * as serviceWorker from './serviceWorker'

import ThemeSwitcher from './components/ThemeSwitcher'
import Sidebar from './components/Sidebar'
import SearchBar from './components/SearchBar'
import BlockSection from './sections/BlockSection'
import { createClient, ScrollToTop } from './utils/util'
import { AlephClient } from './utils/client'
import BlockInfoSection from './sections/BlockInfoSection'
import TransactionInfoSection from './sections/TransactionInfoSection'
import AddressInfoSection from './sections/AddressInfoSection'
import AddressesSection from './sections/AdressesSection'
import TransactionsSection from './sections/TransactionsSection'

interface APIContextType {
  client: AlephClient | undefined
}

export const APIContext = React.createContext<APIContextType>({ client: undefined })

const App = () => {
  const [theme, setTheme] = useStateWithLocalStorage<ThemeType>('theme', 'light')
  const [client, setClient] = useState<AlephClient>()

  const contentRef = useRef(null)

  const getContentRef = useCallback(() => contentRef.current, [])

  useEffect(() => {
    let url: string | null | undefined

    if (process.env.REACT_APP_BACKEND_URL && window.location.hostname === 'localhost') {
      url = process.env.REACT_APP_BACKEND_URL
    } else {
      const xs = window.location.hostname.split('.')
      if (!url && xs.length === 3 && xs[1] === 'alephium' && xs[2] === 'org') {
        url = `${window.location.protocol}//${xs[0]}-backend.${xs[1]}.${xs[2]}`
      }
    }

    setClient(createClient(url || 'http://localhost:9090'))
  }, [])

  return (
    <Router>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyle />
        <APIContext.Provider value={{ client }}>
          <MainContainer>
            <Sidebar />
            <ContentContainer>
              <ContentWrapper ref={contentRef}>
                <ScrollToTop getScrollContainer={getContentRef} />
                <Header>
                  <SearchBar />
                  <ThemeSwitcher
                    currentTheme={theme as ThemeType}
                    switchTheme={setTheme as (arg0: ThemeType) => void}
                  />
                </Header>
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
          </MainContainer>
        </APIContext.Provider>
      </ThemeProvider>
    </Router>
  )
}

/* Custom hooks */
// Local storage hook

function useStateWithLocalStorage<T>(localStorageKey: string, defaultValue: T) {
  const [value, setValue] = React.useState(localStorage.getItem(localStorageKey) || defaultValue)

  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value as string)
  }, [localStorageKey, value])

  return [value, setValue]
}

/* Styles */

const MainContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  overflow: hidden;
`

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
`

const ContentWrapper = styled.main`
  min-height: 100%;
  flex: 1 1 1200px;
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 1400px;
`

const Content = styled.div`
  flex: 1;
  display: flex;
  padding: 0 min(5vw, 50px);
  margin-top: 40px;
  margin-bottom: 40px;
`

const Header = styled.header`
  display: flex;
  align-items: center;
  margin: 40px;
  position: sticky;
  top: 25px;
  z-index: 1;
`

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
)

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
