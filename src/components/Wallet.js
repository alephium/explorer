import React, { Component } from "react";
import ALF from "alf-client";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

class Wallet extends Component {
  constructor() {
    super();
    this.state = {
      address: '',
      balance: 'unknown'
    };

  }

  render() {
    return (
      <div className="container">
        <h1>Wallet</h1>
        <form noValidate autoComplete="off">
          <TextField id="address" label="Address" value={this.state.address} onChange={e => this.updateAddress(e) }/>
        </form>
        <h2>Balance</h2>
        <TextField id="filled-basic" label="ALF" variant="filled" value={this.state.balance} />
        <Button variant="contained" onClick={e => this.getBalance(e)}>Get balance</Button>
        <h2>Transfer</h2>
      </div>
    );
  }

  async componentDidMount() {
    // TODO Create "Sub" component or other means of sharing ALF client logic
    const client = new ALF.NodeClient({
      host: 'localhost',
      port: 10973
    });

    const response = await client.selfClique();

    if (!response) {
      this.log('Self clique not found.');
      return;
    }

    this.client = new ALF.CliqueClient(response.result);
  }

  async getBalance(e) {
    const response = await this.client.getBalance(this.state.address);
    this.setState({
      balance: response.result.balance
    });
  }

  updateAddress(e) {
    this.setState({
      address: e.target.value
    });
  }
}

export default Wallet;
