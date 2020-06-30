import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import { withRouter } from "react-router-dom";
import { createClient } from "../utils/util";

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
              <a href={"../transactions/" + this.state.transaction.hash}>{this.state.transaction.hash}</a>
            </b>
          </Grid>
          <Grid item xs={6}>
            <h4>Inputs</h4>
            {this.state.transaction.inputs.map(input => (
              <a href={"../transactions/" + input.txHash}>{input.txHash}</a>
            ))}
          </Grid>
          <Grid item xs={6}>
            <h4>Outputs</h4>
            {this.state.transaction.outputs.map(output => (
              <div key={output.address}>
                <div className="foo">
                  {output.value} א
                </div>
                <div>
                  <a href={"../addresses/" + output.address + "/transactions"}>{output.address}</a>
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
