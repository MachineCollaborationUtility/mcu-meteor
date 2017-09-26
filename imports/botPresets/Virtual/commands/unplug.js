import { Meteor } from 'meteor/meteor';

module.exports = function unplug(botId, args) {
  Meteor.call('bots.updateState', botId, 'unplug', (error) => {
    if (error) {
      Meteor.Error('Unplug error', error);
    }
    // Should cancel job if job was running
    // if (self.currentJob) {
    //   try {
    //     self.currentJob.cancel();
    //     self.currentJob = undefined;
    //   } catch (ex) {
    //     logger.error('job cancel error', ex);
    //   }
    //   self.currentJob = undefined;
    // }
    // return self.getBot();
  });
};
