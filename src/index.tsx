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

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Route} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme, ThemeType } from './style/themes'
import GlobalStyle from './style/globalStyles'
import * as serviceWorker from './serviceWorker';

import ThemeSwitcher from './components/ThemeSwitcher'
import AddressInfo from './sections/AddressInfo'
import Blocks from './sections/Blocks'
import BlockInfo from './sections/BlockInfo'
import Sidebar from './components/Navigator'
import TransactionInfo from './sections/TransactionInfo'

const App = () => {

  const [theme, setTheme] = useState<ThemeType>('dark');

  return (
    <Router>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme} >
        <GlobalStyle />
        <Sidebar/>
        <div className="content">
          <ThemeSwitcher currentTheme={theme} switchTheme={setTheme} />
          <main>
            <Route exact path="/" component={Blocks}/>
            <Route exact path="/blocks" component={Blocks} />
            <Route path="/blocks/:id" component={BlockInfo} />
            <Route path="/addresses/:id" component={AddressInfo} />
            <Route path="/transactions/:id" component={TransactionInfo} />
          </main>
        </div>
      </ThemeProvider>
    </Router>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'));

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
