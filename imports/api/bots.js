/* global botList */
import { Meteor } from 'meteor/meteor';

let BotState;
if (Meteor.isServer) {
  BotState = require('../server/bots/BotState');
}

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';
import bluebird from 'bluebird';

import * as presets from '../botPresets/**/index.js';

import botFsmDefinitions from '../stateMachines/bots';
import jobFsmDefinitions from '../stateMachines/jobs';

export const Bots = new Mongo.Collection('bots');
export const BotList = {};

Meteor.methods({
  'bots.insert': function ({
    state,
    name,
    model,
    jogSpeedX,
    jogSpeedY,
    jogSpeedZ,
    jogSpeedE,
    tempE,
    tempB,
    offsetX,
    offsetY,
    offsetZ,
    openString,
    endpoint,
  }) {
    // new SimpleSchema({
    //   url: {
    //     type: String,
    //     regEx: SimpleSchema.RegEx.Url,
    //     label: 'Your link',
    //   },
    // }).validate({ url });
    Bots.insert(
      {
        state: state || 'uninitialized',
        name: name || 'Default Name',
        model: model || 'Default Model',
        jogSpeedX: jogSpeedX || 1000,
        jogSpeedY: jogSpeedY || 1000,
        jogSpeedZ: jogSpeedZ || 500,
        jogSpeedE: jogSpeedE || 100,
        tempE: tempE || 200,
        tempB: tempB || 60,
        offsetX: offsetX || 0,
        offsetY: offsetY || 0,
        offsetZ: offsetZ || 0,
        openString: openString || '',
        endpoint: endpoint || '',
        userId: this.userId || null,
        createdAt: moment().valueOf(),
        updatedAt: moment().valueOf(),
        status: null,
      },
      (error, response) => {
        if (error) {
          // We can toss an error to the user if something fudges up.
          return error.reason;
        }
      },
    );
  },
  'bots.remove': function (botId) {
    const bot = Bots.find(botId);

    if (!this.userId || this.userId != bot.userId) {
      throw new Meteor.Error('Unauthorized');
    }

    Bots.remove(botId, (error) => {
      if (error) {
        // We can toss an error to the user if something fudges up.
        return error.reason;
      }
    });
  },
  'bots.command': function (botId, command, args) {
    // Find the bot
    // Find the cooresponding presets
    // Find the function to be called
    // Call it with args
    const bot = Bots.findOne(botId);
    if (!bot) {
      throw new Meteor.Error('No bot found');
    }
    const preset = presets[bot.model];
    if (!preset) {
      throw new Meteor.Error('No preset found');
    }

    if (typeof preset.commands[command] !== 'function') {
      throw new Meteor.Error(`Command "${command}" not found`);
    }

    preset.commands[command](botId, args);
  },
  'bots.updateState': function (botId, action) {
    const bot = Bots.findOne(botId);
    let newState;

    const valid = botFsmDefinitions.fsmEvents.find((event) => {
      // Validate that the initial state is valid.
      // In case of an array of possible from, check each entry in the array
      const fromCheck = Array.isArray(event.from)
        ? event.from.find(state => state === bot.state)
        : event.from === bot.state;
      if (fromCheck && event.name === action && event.to !== undefined) {
        newState = event.to;
        return true;
      }
      return false;
    });

    if (!valid) {
      throw new Meteor.Error(`Invalid state change "${action}" from state "${bot.state}"`);
    }

    Bots.update({ _id: bot._id }, { $set: { state: newState } }, (error, result) => {
      if (error) {
        return error.reason;
      }
    });
  },
  'bots.updateStatus': function (botId, status) {
    const bot = Bots.findOne(botId);

    // Validate status?
    Bots.update({ _id: bot._id }, { $set: { status } }, (error, result) => {
      if (error) {
        return error.reason;
      }
    });
  },
  'bots.initialize': async function () {
    try {
      const bots = Bots.find().fetch();

      bots.forEach((bot) => {
        Bots.update({ _id: bot._id }, { $set: { state: 'uninitialized' } }, (error, result) => {});
      });

      // HACK! Should run new bot state after all bots set to uninitialized
      Meteor.setTimeout(() => {
        bots.forEach((bot) => {
          try {
            BotList[bot._id] = new BotState(bot);
          } catch (ex) {
            throw new Meteor.Error('BotPreset Error', ex);
          }
        });
      }, 1000);
    } catch (ex) {
      throw new Meteor.Error('Initialization error', ex);
    }
  },
});

if (Meteor.isServer) {
  Meteor.call('bots.initialize');

  Meteor.publish('bots', function () {
    return Bots.find({ $or: [{ userId: this.userId }, { userId: null }] });
  });

  // Populate global variable with bots with their id as the key
}
