import React, { Component } from "react";
import ALF from "alf-client";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

class Wallet extends Component {
  constructor() {
    super();
    this.state = {
      address: '',
      balance: 'unknown',
      privateKey: '',
      transferTo: '',
      transferValue: ''
    };

  }

  render() {
    return (
      <div className="container">
        <form noValidate autoComplete="off">
          <TextField id="address" label="Address" value={this.state.address} onChange={e => this.updateAddress(e) }/>
        </form>
        <h2>Balance</h2>
        <TextField id="filled-basic" label="ALF" variant="filled" value={this.state.balance} />
        <br/>
        <Button variant="contained" onClick={e => this.getBalance(e)}>Get balance</Button>
        <h2>Transfer</h2>
        <form noValidate autoComplete="off">
          <TextField id="fromPrivateKey" label="Private key" value={this.state.privateKey} onChange={e => this.updatePrivateKey(e) }/>
          <br/>
          <TextField id="to" label="Recipient address" value={this.state.transferTo} onChange={e => this.updateTransferTo(e) }/>
          <br/>
          <TextField id="value" label="ALF" value={this.state.transferValue} onChange={e => this.updateTransferValue(e) }/>
        </form>
        <Button variant="contained" onClick={e => this.transfer(e)}>Transfer</Button>
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

  async transfer(e) {
    const response = await this.client.transfer(this.state.address, 'pkh', this.state.privateKey,
                                                this.state.transferTo, 'pkh', this.state.transferValue);
    alert('Transaction submitted (txId: ' + response.result.txId + ')');
  }


  updateAddress(e) {
    this.setState({
      address: e.target.value
    });
  }

  updateTransferTo(e) {
    this.setState({
      transferTo: e.target.value
    });
  }

  updatePrivateKey(e) {
    this.setState({
      privateKey: e.target.value
    });
  }

  updateTransferValue(e) {
    this.setState({
      transferValue: e.target.value
    });
  }
}

export default Wallet;
