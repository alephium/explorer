import React from 'react';
import PropTypes from "prop-types";
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Link, withRouter} from 'react-router-dom'

class Navigator extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  state = {
    value: 0
  };

  handleChange = (event, value) => {
    this.setState({ value })
  };

  render() {
    const { location } = this.props;

    let value = this.state.value;
    // TODO Find nice way to deal with this
    if (location.pathname === '/wallet') {
      value = 1;
    } else if (location.pathname.startsWith('/transactions')) {
      value = 2;
    }

    return (
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Blocks" component={Link} to="/blocks" />
          <Tab label="Wallet" component={Link} to="/wallet" />
          <Tab label="Transactions" disabled />
        </Tabs>
      </AppBar>
    );
  }
}

export default withRouter(Navigator);
