import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { createClient } from "../utils/util";

class AddressTransactions extends Component {
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
        <p><pre>{this.state.address}</pre></p>
        <h4>Transactions</h4>
        {this.state.transactions.map(tx => (
          <div key={tx.hash}>
            <a href={"../../transactions/" + tx.hash}><pre>{tx.hash}</pre></a>
          </div>
        ))}
      </div>
    )
  }

  async componentDidMount() {
    this.client = await createClient();
    const address = this.props.match.params.id;
    const transactions = await this.client.addressTransactions(address);

    this.setState({ 
      address: address,
      transactions: transactions,
    });
  }
}

export default withRouter(AddressTransactions);
