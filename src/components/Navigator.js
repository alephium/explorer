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
import PropTypes from "prop-types";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Link, withRouter} from 'react-router-dom'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import styled from 'styled-components'

import logo from '../images/logo-h.svg';

class Navigator extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  state = {
    value: 0
  };

  handleChange = (event, value) => {
    this.setState({ value })
  };

  render() {
    const { location } = this.props;

    let value = this.state.value;
    // TODO Find nice way to deal with this
    if (location.pathname.startsWith('/addresses')) {
      value = 1;
    } else if (location.pathname.startsWith('/transactions')) {
      value = 2;
    }


    return (
      <SidebarContainer>
        <img alt="alephium" src={logo} className="logo"/>
        <Tabs
          value={value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Blocks" icon={<AccountTreeIcon/>} component={Link} to="/blocks" />
          <Tab label="Addresses" icon={<AccountBalanceWalletIcon/>} disabled />
          <Tab label="Transactions" icon={<CompareArrowsIcon/>} disabled />
        </Tabs>
      </SidebarContainer>
    );
  }
}

const SidebarContainer = styled.div`
  background: transparent;
  border-radius: 3px;
  border: 2px solid palevioletred;
  color: palevioletred;
  margin: 0 1em;
  padding: 0.25em 1em;
`

export default withRouter(Navigator);
