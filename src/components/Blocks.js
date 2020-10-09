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
import Moment from 'react-moment';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createClient } from "../utils/util";

const moment = require("moment");

const loadingCSS = {
  height: "100px",
  margin: "30px"
};

class Blocks extends Component {

  constructor() {
    super();

    this.state = {
      blocks: [],
      loading: false,
      timestamp: moment().valueOf(),
      prevY: 0
    };

    this.update = this.update.bind(this)
  }

  render() {
    // To change the loading icon behavior
    const loadingTextCSS = { display: this.state.loading ? "block" : "none" };

    return (
      <div>
        <Grid container>
          {this.state.blocks.map(block => (
            <Grid item xs={6} className="content" key={block.hash} container justify="center">
              <Card className="card">
                <CardContent>
                  <Typography className="title">
                    <a href={"./blocks/" + block.hash}><pre>#{block.hash}</pre></a>
                  </Typography>
                  <Typography className="props" color="textSecondary">
                    height: ⇪ {block.height}<br/>
                    chain index: {block.chainFrom} ➡ {block.chainTo}
                  </Typography>
                  <Typography className="time">
                    <Moment fromNow>{block.timestamp}</Moment> (<Moment format="YYYY/MM/DD HH:mm:ss">{block.timestamp}</Moment>)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <div
          ref={loadingRef => (this.loadingRef = loadingRef)}
          style={loadingCSS}
        >
          <span style={loadingTextCSS}>Loading...</span>
        </div>
      </div>
    );
  }

  async componentDidMount() {
    this.client = await createClient();

    this.getBlocks(this.state.timestamp);

    let intervalId = setInterval(this.update, 20 * 1000);
    this.setState({intervalId: intervalId});

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0
    };

    this.observer = new IntersectionObserver(
      this.handleObserver.bind(this),
      options
    );

    this.observer.observe(this.loadingRef);
  }

  async componentWillUnmount() {
    if (this.state.intervalId) clearInterval(this.state.intervalId);
    if (this.websocket) this.websocket.close();
    if (this.observer) this.observer.disconnect();
  }

  async getBlocks(timestamp) {
    this.setState({ loading: true });

    const to = moment(timestamp);
    const from = to.clone().subtract(10, 'minutes');

    console.log('Fetching blocks: ' + from.format() + ' -> ' + to.format() + ' (' + from + ' -> ' + to + ')');

    const blocks = await this.client.blocks(from.valueOf(), timestamp);

    blocks.sort(function (a, b) {
      return b.timestamp - a.timestamp;
    });

    this.setState({ 
      blocks: this.state.blocks.concat(blocks),
      loading: false
    });
  }

  handleObserver(entities, observer) {
    const y = entities[0].boundingClientRect.y;
    const length = this.state.blocks.length;
    if (this.state.prevY > y && length > 0) {
      const last = this.state.blocks[length - 1].timestamp;
      this.getBlocks(last - 1);
      if (this.state.blocks > length) {
        this.setState({ timestamp: last });
      }
    }
    this.setState({ prevY: y });
  }

  update() {
    this.setState({timestamp: moment().valueOf()});
    this.getBlocks(this.state.timestamp);
  }
}

export default Blocks;
