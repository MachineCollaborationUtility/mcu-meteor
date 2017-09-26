/* global logger */
const request = require('request-promise');

async function checkPause(self) {
  if (self.fsm.current === 'paused') {
    return;
  }
  // ping each bot
  // If they're all connected, then we are done connecting
  let pauseDone = true;
  await Promise.map(self.settings.custom.players, async (player) => {
    const checkParams = {
      method: 'GET',
      uri: player.endpoint,
      json: true,
    };

    const reply = await request(checkParams)
    .catch((ex) => { logger.error('Check pause player error', ex); });

    if (reply.data.state !== 'paused') {
      pauseDone = false;
    }
  })
  .catch((ex) => { logger.error('Get players pause info error', ex); });

  if (self.fsm.current === 'paused') {
    return;
  }

  if (pauseDone) {
    self.currentJob.pause();
    self.fsm.pauseDone();
  } else {
    // Wait 2 seconds before checking again if it is paused
    await Promise.delay(2000);
    checkPause(self);
  }
}


module.exports = async function pause(self) {
  // TODO should not be able to pause unless all players are running
  if (self.currentJob === undefined) {
    throw new Error(`Bot ${self.settings.name} is not currently processing a job`);
  }
  if (self.fsm.current !== 'executingJob') {
    throw new Error(`Cannot pause bot from state "${self.fsm.current}"`);
  }
  if (self.currentJob.fsm.current !== 'running') {
    throw new Error(`Cannot pause job from state "${self.currentJob.fsm.current}"`);
  }

  try {
    self.pauseableState = self.fsm.current;
    self.fsm.pause();
    const players = self.settings.custom.players;
    await Promise.map(players, async (player) => {
      // Ping each job for status
      const pauseParams = {
        method: 'POST',
        uri: player.endpoint,
        body: { command: 'pause' },
        json: true,
      };

      const pauseReply = await request(pauseParams)
      .catch((ex) => { logger.error('Pause fail', ex); });

      checkPause(self);
      logger.info('Paused bot', player, pauseReply);
    });
  } catch (ex) {
    logger.error(ex);
  }
  return self.getBot();
};
