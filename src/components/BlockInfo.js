// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

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
            <pre># {this.state.block.hash}</pre>
          </Grid>
          <Grid item xs={12}>
            <h4>Transactions</h4>
            {this.state.block.transactions.map(tx => (
              <a key={tx.hash} href={"../transactions/" + tx.hash}><pre>{tx.hash}</pre></a>
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
