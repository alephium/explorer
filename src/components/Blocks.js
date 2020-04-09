import React, { Component } from "react";
import Moment from 'react-moment';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createClient } from "../utils/util";

const moment = require("moment");

const useStyles = theme => ({
  root: {
    padding: 24,
  },
  card: {
    minWidth: 375,
  },
  title: {
    fontSize: 22,
  },
  props: {
    marginBottom: 12,
  },
  time: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

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
    const { classes } = this.props;

    // Additional css
    const loadingCSS = {
      height: "100px",
      margin: "30px"
    };

    // To change the loading icon behavior
    const loadingTextCSS = { display: this.state.loading ? "block" : "none" };

    return (
      <div>
        <Grid container>
          {this.state.blocks.map(block => (
            <Grid className={classes.root} key={block.hash} container xs={6} justify="center">
              <Card className={classes.card}>
                <CardContent>
                  <Typography className={classes.title}>
                    # {block.hash}
                  </Typography>
                  <Typography className={classes.props} color="textSecondary">
                    height: ⇪ {block.height}<br/>
                    chain index: {block.chainFrom} ➡ {block.chainTo}
                  </Typography>
                  <Typography className={classes.time}>
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

    this.websocket = this.client.getWebSocket(0);

    this.websocket.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    this.websocket.onmessage = (message) => {
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

  async componentWillUnmount() {
    this.websocket.close();
    if (this.observer) this.observer.disconnect();
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

export default withStyles(useStyles)(Blocks);
