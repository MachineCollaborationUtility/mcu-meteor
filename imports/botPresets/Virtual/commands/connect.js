import { Bots, BotList } from '../../../api/bots';
import { Meteor } from 'meteor/meteor';

module.exports = function connect(botId, args) {
  try {
    const bot = Bots.findOne(botId);
    if (bot.state !== 'ready') {
      throw new Error(`Cannot connect from state "${self.fsm.current}"`);
    }

    Meteor.call('bots.updateState', botId, 'connect', (error, response) => {
      const botState = BotList[botId];
      botState.queue.queueCommands({
        open: true,
        postCallback: async () => {
          // await delay(100); // Fake connecting delay
          botState.presets.commands.toggleUpdater(botState, { update: true });
          Meteor.call('bots.updateState', botId, 'connectDone', (error, response) => {});
        },
      });
    });
  } catch (ex) {
    Meteor.call('bots.updateState', botId, 'connectFail', (error, response) => {});
  }
};
