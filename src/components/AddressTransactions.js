import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { createClientLight } from "../utils/util";

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
        <h4>{this.state.address}</h4>
        {this.state.transactions.map(tx => (
          <div>
            <a href={"../../transactions/" + tx.hash}>{tx.hash}</a>
          </div>
        ))}
      </div>
    )
  }

  async componentDidMount() {
    this.client = await createClientLight();
    const address = this.props.match.params.id;
    const transactions = await this.client.addressTransactions(address);

    this.setState({ 
      address: address,
      transactions: transactions,
    });
  }
}

export default withRouter(AddressTransactions);
