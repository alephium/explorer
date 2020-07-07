import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import { withRouter } from "react-router-dom";
import { createClient } from "../utils/util";
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';

class TransactionInfo extends Component {
  constructor() {
    super();
    this.state = {
      transaction: {
        hash: null,
        inputs: [],
        outputs: [],
      },
    };
  }

  render() {
    return (
      <div>
        <Grid container>
          <Grid item xs={12}>
            <b>
              <pre><CompareArrowsIcon/> <a href={"../transactions/" + this.state.transaction.hash}>{this.state.transaction.hash}</a></pre>
            </b>
          </Grid>
          <Grid item xs={6}>
            <h4>Inputs</h4>
            {this.state.transaction.inputs.map(input => (
              <div>
                <div>
                  <pre><CompareArrowsIcon/> <a href={"../transactions/" + input.txHashRef}>{input.txHashRef}</a></pre>
                </div>
                <div className="fieldRight">
                  {input.amount} א
                </div>
                <div>
                  <pre><AccountBalanceWalletIcon/> <a href={"../addresses/" + input.address + "/transactions"}>{input.address}</a></pre>
                </div>
              </div>
            ))}
          </Grid>
          <Grid item xs={6}>
            <h4>Outputs</h4>
            {this.state.transaction.outputs.map(output => (
              <div key={output.address}>
                <div className="fieldRight">
                  {output.amount} א
                </div>
                <div>
                  <pre><AccountBalanceWalletIcon/> <a href={"../addresses/" + output.address + "/transactions"}>{output.address}</a></pre>
                </div>
              </div>
            ))}
          </Grid>
        </Grid>
      </div>
    )
  }

  async componentDidMount() {
    this.client = await createClient();
    const transaction = await this.client.transaction(this.props.match.params.id);
    this.setState({ transaction: transaction });
  }
}
export default withRouter(TransactionInfo);
