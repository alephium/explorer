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
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import { Route, Routes, useNavigate } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'

import AppFooter from './components/AppFooter'
import AppHeader from './components/AppHeader'
import { useGlobalContext } from './contexts/global'
import PageNotFound from './pages/404'
import AddressInfoSection from './pages/AddressInfoPage'
import BlockInfoSection from './pages/BlockInfoPage'
import HomeSection from './pages/HomePage/HomePage'
import TransactionInfoSection from './pages/TransactionInfoPage'
import GlobalStyle, { deviceBreakPoints } from './style/globalStyles'
import { darkTheme, lightTheme } from './style/themes'
import { SnackbarMessage } from './types/ui'

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
  const navigate = useNavigate()

  // Ensure that old HashRouter URLs get converted to BrowserRouter URLs
  if (location.hash.startsWith('#/')) navigate(location.hash.replace('#', ''))

  return (
    <ThemeProvider theme={currentTheme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <MainContainer>
        <AnimateSharedLayout>
          <AppHeader />
          <ContentContainer>
            <ContentWrapper>
              <Content>
                <Routes>
                  <Route path="/" element={<HomeSection />} />
                  <Route path="/blocks/:id" element={<BlockInfoSection />} />
                  <Route path="/addresses/:id" element={<AddressInfoSection />} />
                  <Route path="/transactions/:id" element={<TransactionInfoSection />} />
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </Content>
            </ContentWrapper>
          </ContentContainer>
        </AnimateSharedLayout>
        <AppFooter />
        <SnackbarManager message={snackbarMessage} />
      </MainContainer>
      <Background />
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
  overflow-y: auto;
  overflow-x: hidden;
`

const Background = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: -2;
  background-color: ${({ theme }) => theme.body};
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
