import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'
import './index.css';
import * as serviceWorker from './serviceWorker';

import Blocks from './components/Blocks'
import Wallet from './components/Wallet'

ReactDOM.render(
  <Router>
      <div>
        <aside>
          <ul>
            <li>
              <Link to={`/blocks`}>Blocks</Link>
            </li>
            <li>
              <Link to={`/wallet`}>Wallet</Link>
            </li>
          </ul>
        </aside>
        <main>
          <Route exact path="/blocks" component={Blocks} />
          <Route path="/wallet" component={Wallet} />
        </main>
      </div>
  </Router>,
  document.getElementById('root')
);

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
