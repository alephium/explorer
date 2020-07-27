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
