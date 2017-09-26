/* global logger */
const request = require('request-promise');
const path = require('path');

const botFsmDefinitions = require('../../../stateMachines/bots');
const jobFsmDefinitions = require('../../../stateMachines/jobs');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function checkResume(self) {
  // ping each bot
  // If they're all connected, then we are done connecting
  let resumeDone = true;
  await Promise.map(self.settings.custom.players, async (player) => {
    const checkParams = {
      method: 'GET',
      uri: player.endpoint,
      json: true,
    };
    const reply = await request(checkParams).catch((ex) => {
      logger.error('Get bot resume info error', ex);
    });

    if (!botFsmDefinitions.metaStates.pauseable.includes(reply.data.state)) {
      resumeDone = false;
    }
  }).catch((ex) => {
    logger.error('Get players resume info error', ex);
  });

  if (resumeDone) {
    const command = `resume${capitalizeFirstLetter(self.pauseableState)}`;
    // Resume the bot
    self.fsm[command]();
  } else {
    // Wait 2 seconds and then check the status again
    await Promise.delay(2000);
    checkResume(self);
  }
}

module.exports = async function resume(self) {
  try {
    // TODO should not be able to resume unless all players are paused
    if (self.currentJob === undefined) {
      throw new Error(`Bot ${self.settings.name} is not currently processing a job`);
    }
    if (self.fsm.current !== 'paused') {
      throw new Error(`Cannot resume bot from state "${self.fsm.current}"`);
    }
    if (self.currentJob.fsm.current !== 'paused') {
      throw new Error(`Cannot resume job from state "${self.currentJob.fsm.current}"`);
    }

    self.fsm.resume();

    const players = self.settings.custom.players;
    await Promise.map(players, async (player) => {
      // Ping each job for status
      const resumeParams = {
        method: 'POST',
        uri: player.endpoint,
        body: { command: 'resume' },
        json: true,
      };

      await request(resumeParams).catch((ex) => {
        logger.error('Resume conductor player fail', ex);
      });
    });

    self.currentJob.fsm.resume();

    checkResume(self);
  } catch (ex) {
    logger.error(ex);
  }

  return self.getBot();
};
