import React, { Component } from "react";
import ALF from "alf-client";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

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

class Wallet extends Component {
  constructor() {
    super();
    this.state = {
      address: '',
      balance: 'unknown',
      transferTo: '',
      transferValue: ''
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
              <TextField id="to" className={classes.field} label="Recipient address" value={this.state.transferTo} onChange={e => this.updateTransferTo(e) }/>
              <br/>
              <TextField id="value" label="ALF" className={classes.field} value={this.state.transferValue} onChange={e => this.updateTransferValue(e) }/>
            </form>
            <br/>
            <Button variant="contained" onClick={e => this.transfer(e)}>Transfer</Button>
          </div>
        </div>
      </div>
    );
  }

  async componentDidMount() {
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
    const response = await this.client.transfer(this.state.address, 'pkh', 'b0e218ff0d40482d37bb787dccc7a4c9a6d56c26885f66c6b5ce23c87c891f5e',
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

  updateTransferValue(e) {
    this.setState({
      transferValue: e.target.value
    });
  }
}

export default withStyles(useStyles)(Wallet);
