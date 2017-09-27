import React from 'react';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import autobind from 'react-autobind';

export default class Bot extends React.Component {
  constructor(props) {
    super(props);

    autobind(this);
  }

  connect() {
    Meteor.call('bots.command', this.props._id, 'connect');
  }

  render() {
    return (
      <div style={{ background: '#CFFFFF', border: 'solid 1px black' }}>
        <p>{JSON.stringify(this.props)}</p>
        <button onClick={this.connect}>Connect</button>
        <br />
      </div>
    );
  }
}
