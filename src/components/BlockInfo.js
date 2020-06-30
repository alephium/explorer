import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import { withRouter } from "react-router-dom";
import { createClient } from "../utils/util";

class BlockInfo extends Component {
  constructor() {
    super();
    this.state = {
      block: {
        hash: null,
        transactions: [],
      },
    };
  }

  render() {
    return (
      <div>
        <Grid container>
          <Grid item xs={12}>
            # {this.state.block.hash}
          </Grid>
          <Grid item xs={12}>
            <h4>Transactions</h4>
            {this.state.block.transactions.map(tx => (
              <a key={tx.hash} href={"../transactions/" + tx.hash}>{tx.hash}</a>
            ))}
          </Grid>
        </Grid>
      </div>
    )
  }

  async componentDidMount() {
    this.client = await createClient();
    const block = await this.client.block(this.props.match.params.id);
    this.setState({ block: block });
  }
}
export default withRouter(BlockInfo);
