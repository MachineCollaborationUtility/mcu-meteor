import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import FlipMove from 'react-flip-move';
import moment from 'moment';
import autobind from 'react-autobind';

import { Bots as BotAPI } from '../../api/bots';

export default class Bots extends React.Component {
  constructor(props) {
    super(props);

    this.updateDelay = 10;

    this.state = {
      bots: [],
      lastUpdated: moment().valueOf(),
    };

    autobind(this);
  }

  componentDidMount() {
    this.linksTracker = Tracker.autorun(() => {
      Meteor.subscribe('bots');

      const bots = BotAPI.find().fetch();

      // When a new item is created
      // optimistic loading momentarily creates the illusion that 2 collection items are created
      // To deal with this, we compare the current time with the time that the new collection item was provided
      // If an update happens prior to the timeout function being called
      // Then the state will be updated by the later callback

      setTimeout(() => {
        const currentTime = moment().valueOf();
        if (currentTime - this.state.lastUpdated >= this.updateDelay) {
          this.setState({ bots });
        }
      }, this.updateDelay);

      this.setState({ lastUpdated: moment().valueOf() });
    });
  }

  componentWillUnmount() {
    this.linksTracker.stop();
  }

  renderBots() {
    if (this.state.bots.length === 0) {
      return (
        <div className="item">
          <p className="item__status-message">No Bots</p>
        </div>
      );
    }

    return this.state.bots.map(bot => <p key={bot._id}>{JSON.stringify(bot)}</p>);
  }

  createVirtualBot() {
    Meteor.call('bots.insert', { model: 'Virtual' }, (error) => {
      if (error) {
        throw Meteor.Error('Create Virtual Bot error', error);
      }
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.createVirtualBot}>Create Bot</button>
        <FlipMove maintainContainerHeight>{this.renderBots()}</FlipMove>
      </div>
    );
  }
}
