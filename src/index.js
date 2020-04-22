import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'
import './index.css';
import * as serviceWorker from './serviceWorker';

import logo from './images/logo-h.svg';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Blocks from './components/Blocks'
import Wallet from './components/Wallet'

class App extends React.Component {
  state = {
    value: false
  };

  handleChange = (event, value) => {
    this.setState({ value })
  };

  render() {
    return (
      <Router>
        <div>
          <img alt="alephium" src={logo} className="logo"/>
          <AppBar position="static" color="default">
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Blocks" component={Link} to="/blocks" />
              <Tab label="Wallet" component={Link} to="/wallet" />
            </Tabs>
          </AppBar>

          <main>
            <Route path="/blocks" component={Blocks} />
            <Route path="/wallet" component={Wallet} />
          </main>
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
