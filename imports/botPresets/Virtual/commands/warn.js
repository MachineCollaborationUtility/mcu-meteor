import { Meteor } from 'meteor/meteor';

module.exports = function warn(botId, args) {
  const warning = args.warning;
  if (!warning) {
    throw new Error('Warn param "warning" is not defined');
  }

  const command = `${warning}Handle`;

  Meteor.call('bots.command', botId, command, (error) => {
    if (error) {
      throw new Meteor.Error('Error issuing command', command, error);
    }
  });
};
