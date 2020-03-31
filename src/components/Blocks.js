import React, { Component } from "react";
import ALF from "alf-client";
import Moment from 'react-moment';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const moment = require("moment");

class Blocks extends Component {
  constructor() {
    super();
    this.state = {
      blocks: [],
      loading: false,
      timestamp: moment().valueOf(),
      prevY: 0
    };

  }

  render() {

    // Additional css
    const loadingCSS = {
      height: "100px",
      margin: "30px"
    };

    // To change the loading icon behavior
    const loadingTextCSS = { display: this.state.loading ? "block" : "none" };

    return (


      <div className="container">
        <h1>Blocks History</h1>
        <Grid container>
          {this.state.blocks.map(block => (
            <Grid key={block.hash} container xs={12}>
              <Paper style={{ minWidth: "600px", minHeight: "120px" }}>
                <Grid item>
                  block: # {block.hash}
                </Grid>
                <Grid item>
                  height: ⇪ {block.height}
                </Grid>
                <Grid item>
                  chain index: {block.chainFrom} ➡ {block.chainTo}
                </Grid>
                <Grid item>
                  <Moment fromNow>{block.timestamp}</Moment>
                </Grid>
              </Paper>
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


    this.getBlocks(this.state.timestamp);

    const websocket = this.client.getWebSocket(0);

    websocket.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    websocket.onmessage = (message) => {
      const notification = JSON.parse(message.data);
      if (notification.method === 'block_notify') {
        const block = notification.params;
        console.log('Prepending new block: ' + block.hash);
        this.setState({ blocks: [block].concat(this.state.blocks) });
      } 
    };

    var options = {
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

  async getBlocks(timestamp) {
    this.setState({ loading: true });

    const to = moment(timestamp);
    const from = to.clone().subtract(2, 'minutes');

    console.log('Fetching blocks: ' + from.format() + ' -> ' + to.format() + ' (' + from + ' -> ' + to + ')');

    const response = await this.client.blockflowFetch(from.valueOf(), timestamp);
    const blocks = response.result.blocks;

    blocks.sort(function (a, b) {
      return b.timestamp - a.timestamp;
    });

    this.setState({ blocks: this.state.blocks.concat(response.result.blocks) });
    this.setState({ loading: false });
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
}

export default Blocks;
