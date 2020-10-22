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

import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { createClient } from "../utils/util";
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';

class AddressInfo extends Component {
  constructor() {
    super();
    this.state = {
      address: "",
      transactions: [],
    };
  }

  render() {
    return (
      <div>
        <p><pre><AccountBalanceWalletIcon/> {this.state.address}</pre></p>
        <p><AccountBalanceIcon/> {this.state.balance} א</p>

        <h4>Transactions</h4>
        {this.state.transactions.map(tx => (
          <div key={tx.hash}>
            <pre><CompareArrowsIcon/> <a href={"../../transactions/" + tx.hash}>{tx.hash}</a></pre>
          </div>
        ))}
      </div>
    )
  }

  async componentDidMount() {
    this.client = await createClient();
    const address = this.props.match.params.id;
    const info = await this.client.address(address);

    this.setState({ 
      address: address,
      balance: info.balance,
      transactions: info.transactions,
    });
  }
}

export default withRouter(AddressInfo);
