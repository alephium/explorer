import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { createClient } from "../utils/util";
import { Wallet } from "alf-client";

const useStyles = theme => ({
  root: {
    padding: 24,
  },
  section: {
    paddingBottom: 42,
  },
  form: {
    width: 600,
    margin: 'auto',
  },
  field: {
    width: 600,
  }
});

class WalletPanel extends Component {
  constructor() {
    super();
    this.state = {
      address: '',
      privateKey: '',
      balance: 'unknown',
      transferTo: '',
      transferValue: '',
      newPublicKey: '',
      newPrivateKey: '',
    };
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.form}>
          <div className={classes.section}>
            <form noValidate autoComplete="off">
              <TextField className={classes.field} id="address" label="Address" value={this.state.address} onChange={e => this.updateAddress(e) }/>
            </form>
          </div>
          <div className={classes.section}>
            <h2>Balance</h2>
            <TextField className={classes.field} id="filled-basic" label="ALF" variant="filled" value={this.state.balance} />
            <br/>
            <br/>
            <Button variant="contained" onClick={e => this.getBalance(e)}>Get balance</Button>
          </div>
          <div className={classes.section}>
            <h2>Transfer</h2>
            <form noValidate autoComplete="off">
              <TextField id="privateKey" className={classes.field} label="Private key" value={this.state.privateKey} onChange={e => this.updatePrivateKey(e) }/>
              <br/>
              <TextField id="to" className={classes.field} label="Recipient address" value={this.state.transferTo} onChange={e => this.updateTransferTo(e) }/>
              <br/>
              <TextField id="value" label="ALF" className={classes.field} value={this.state.transferValue} onChange={e => this.updateTransferValue(e) }/>
            </form>
            <br/>
            <Button variant="contained" onClick={e => this.transfer(e)}>Transfer</Button>
          </div>
          <div className={classes.section}>
            <h2>Key Pair</h2>
            <form noValidate autoComplete="off">
              <TextField className={classes.field} id="filled-basic" label="PublicKey" variant="filled" value={this.state.newPublicKey} />
              <br/>
              <TextField className={classes.field} id="filled-basic" label="PrivateKey" variant="filled" value={this.state.newPrivateKey} />
            </form>
            <br/>
            <Button variant="contained" onClick={e => this.generateKeyPair()}>Generate</Button>
          </div>
        </div>
      </div>
    );
  }

  async componentDidMount() {
    this.client = await createClient();
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

  updatePrivateKey(e) {
    this.setState({
      privateKey: e.target.value
    })
  }

  updateTransferTo(e) {
    this.setState({
      transferTo: e.target.value
    });
  }

  updateTransferValue(e) {
    this.setState({
      transferValue: e.target.value
    });
  }

  generateKeyPair() {
    const wallet = new Wallet();
    wallet.random();
    this.setState({
      newPublicKey: wallet.pubKey,
      newPrivateKey: wallet.priKey
    })
  }
}

export default withStyles(useStyles)(WalletPanel);
