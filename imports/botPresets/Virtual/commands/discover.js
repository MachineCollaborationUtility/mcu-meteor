import { Meteor } from 'meteor/meteor';

module.exports = function discover(botId, args) {
  // A bit overkill, but allows for other bots to have a state while discovering
  Meteor.call('bots.updateState', botId, 'discover', (discoveryError) => {
    if (discoveryError) {
      throw new Meteor.Error('Discovery error', discoveryError);
    }
    Meteor.call('bots.updateState', botId, 'initializationDone', (initializationError) => {
      if (initializationError) {
        throw new Meteor.Error('Initialization done error', initializationError);
      }
    });
  });
};
