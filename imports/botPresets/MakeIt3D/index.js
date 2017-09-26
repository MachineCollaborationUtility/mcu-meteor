import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
  const _ = require('lodash');

  const VirtualBot = require('../Virtual');

  const connect = require('./commands/connect');
  const generateParkCommands = require('./commands/generateParkCommands');
  const generateUnparkCommands = require('./commands/generateUnparkCommands');

  const info = {
    connectionType: 'serial',
    fileTypes: ['.gcode'],
    vidPid: [
      {
        vid: 0x0403,
        pid: 0x6015,
      },
    ],
    baudrate: 250000,
  };

  const settings = {
    name: 'MakeIt-3D',
    model: __dirname.split('/')[__dirname.split('/').length - 1],
  };

  const commands = {
    connect,
    generateParkCommands,
    generateUnparkCommands,
  };

  module.exports = {
    info: _.extend(Object.assign({}, VirtualBot.info), info),
    settings: _.extend(Object.assign({}, VirtualBot.settings), settings),
    commands: _.extend(Object.assign({}, VirtualBot.commands), commands),
  };
}
