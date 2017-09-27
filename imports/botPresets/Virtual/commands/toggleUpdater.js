module.exports = function toggleUpdater(botState, params) {
  if (botState.updateInterval === undefined) {
    botState.updateInterval = false;
  }

  const update = params.update;
  if (update === undefined) {
    throw new Error('"update" is not defined');
  }

  if (update) {
    if (botState.updateInterval === false) {
      botState.updateInterval = setInterval(() => {
        botState.presets.commands.updateRoutine(botState);
      }, 2000);
    }
    return 'Bot update routine is on';
  }

  if (botState.updateInterval !== false) {
    clearInterval(botState.updateInterval);
    botState.updateInterval = false;
  }

  return 'Bot update routine is off';
};
