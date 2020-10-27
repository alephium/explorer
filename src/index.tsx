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

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Redirect, Route} from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme, ThemeType } from './style/themes'
import GlobalStyle from './style/globalStyles'
import * as serviceWorker from './serviceWorker';

import ThemeSwitcher from './components/ThemeSwitcher'
import AddressInfo from './sections/AddressInfo'
import BlockInfo from './sections/BlockInfo'
import Sidebar from './components/Sidebar'
import TransactionInfo from './sections/TransactionInfo'
import SearchBar from './components/SearchBar';
import BlockSection from './sections/BlockSection';

const App = () => {

  let [theme, setTheme] = useStateWithLocalStorage<ThemeType>('theme', 'light')
  
  return (
    <Router>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme} >
        <GlobalStyle />
        <MainContainer>
          <Sidebar/>
          <ContentWrapper>
            <ThemeSwitcher currentTheme={theme as ThemeType} switchTheme={setTheme as (arg0: ThemeType) => void} />
            <Content>
              <SearchBar />
              <SectionWrapper>
                <Route exact path="/">
                  <Redirect to="/blocks" />
                </Route>
                <Route exact path="/blocks">
                  <BlockSection />
                </Route>
                <Route path="/blocks/:id" component={BlockInfo} />
                <Route path="/addresses/:id" component={AddressInfo} />
                <Route path="/transactions/:id" component={TransactionInfo} />
              </SectionWrapper>
            </Content>
          </ContentWrapper>
        </MainContainer>
      </ThemeProvider>
    </Router>
  )
}

/* Custom hooks */
// Local storage hook

function useStateWithLocalStorage<T>(localStorageKey: string, defaultValue: T) {
  const [value, setValue] = React.useState(
    localStorage.getItem(localStorageKey) || defaultValue
  )
 
  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value as string);
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

const ContentWrapper = styled.main`
  flex: 1;
  overflow-y: scroll;
`

const Content = styled.div`
  max-width: 900px;
  margin: 60px auto;
`

const SectionWrapper = styled.main`
  padding-top: 105px;
`

ReactDOM.render(<App/>, document.getElementById('root'));

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
