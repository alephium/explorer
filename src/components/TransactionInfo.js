import React, { Component } from "react";
import { withRouter } from "react-router-dom";

class TransactionInfo extends Component {
  render() {
    return (
      <div>
        Hello World: 
        {this.props.match.params.id}
      </div>
    )
  }
}
export default withRouter(TransactionInfo);
