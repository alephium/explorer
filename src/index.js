import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route} from 'react-router-dom'
import './index.css';
import * as serviceWorker from './serviceWorker';

import logo from './images/logo-h.svg';

import Blocks from './components/Blocks'
import Navigator from './components/Navigator'
import Wallet from './components/Wallet'

class App extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <img alt="alephium" src={logo} className="logo"/>
          <Navigator/>
          <div className="content">
            <main>
              <Route exact path="/" component={Blocks}/>
              <Route path="/blocks" component={Blocks} />
              <Route path="/wallet" component={Wallet} />
            </main>
          </div>
        </div>
      </Router>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));

//
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
