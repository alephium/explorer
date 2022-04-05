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

import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useRef } from 'react'
import { Redirect, Route } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'

import AppFooter from './components/AppFooter'
import AppHeader from './components/AppHeader'
import { useGlobalContext } from './contexts/global'
import AddressInfoSection from './sections/AddressInfoSection'
import AddressesSection from './sections/AdressesSection'
import BlockInfoSection from './sections/BlockInfoSection'
import BlockSection from './sections/BlockSection'
import TransactionInfoSection from './sections/TransactionInfoSection'
import TransactionsSection from './sections/TransactionsSection'
import GlobalStyle, { deviceBreakPoints } from './style/globalStyles'
import { darkTheme, lightTheme } from './style/themes'
import { SnackbarMessage } from './types/ui'
import { ScrollToTop } from './utils/routing'

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
  const { snackbarMessage, currentTheme } = useGlobalContext()
  const contentRef = useRef(null)

  const getContentRef = useCallback(() => contentRef.current, [])

  return (
    <ThemeProvider theme={currentTheme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
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
    </ThemeProvider>
  )
}

export default App

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
  padding: 35px min(5vw, 50px) 0;
`

const ContentWrapper = styled.main`
  min-height: 100%;
  flex: 1 1 1200px;
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 1200px;

  @media ${deviceBreakPoints.mobile} {
    width: 100%;
    justify-self: flex-start;
  }
`

const Content = styled.div`
  flex: 1;
  display: flex;
  margin-bottom: 40px;
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
