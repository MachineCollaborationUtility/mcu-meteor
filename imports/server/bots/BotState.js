import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

import * as presets from '../../botPresets/**/index.js';
import * as comProtocols from './comProtocols/**/index.js';
import CommandQueue from './commandQueue';

class BotState {
  constructor(dbBot) {
    this.settings = dbBot;
    this.presets = presets[this.settings.model];
    if (!this.presets) {
      throw new Meteor.Error(`No Preset found for bot model "${this.settings.model}"`);
    }
    this.presets.commands.initialize(this);

    this.discover();
  }

  /**
   * expandCode()
   *
   * Expand simple commands to gcode we can send to the bot
   *
   * Args:   code - a simple string gcode command
   * Return: a gcode string suitable for the hardware
   */
  expandCode(code) {
    return `${code}\n`;
  }

  discover() {
    // Allow immediate discovery of virtual hardware or real hardware when the
    if (this.presets.info.connectionType !== 'serial') {
      // Call discover

      Meteor.call('bots.updateState', this.settings._id, 'discover', (error) => {
        if (error) {
          throw new Meteor.Error('discover error', error);
        }
        // Set up the validator and executor

        // switch (this.presets.info.connectionType) {
        //       case 'serial': {
        //         const openPrime = this.settings.openString == undefined ? 'M501' : this.settings.openString;
        //         executor = new SerialCommandExecutor(
        //           this.app,
        //           this.port,
        //           this.info.baudrate,
        //           openPrime,
        //           this
        //         );
        //         validator = this.validateSerialReply;
        //         break;
        //       }
        //       case 'virtual':
        //       case 'conductor': {
        //         executor = new VirtualExecutor(this.app);
        //         validator = this.validateSerialReply;
        //         break;
        //       }

        const ExecutorType = comProtocols[this.presets.info.connectionType];
        if (!ExecutorType) {
          throw new Meteor.Error(`Invalid executor type "${this.presets.info.connectionType}"`);
        }

        const executor = new ExecutorType({ settings: this.settings, info: this.presets.info });
        const validator = ExecutorType.validator;

        // Set up the bot's command queue
        this.queue = new CommandQueue(executor, this.expandCode, _.bind(validator, this));

        // this.fsm.initializationDone();
        // } catch (ex) {
        //   logger.error(ex);
        //   this.fsm.initializationFail();
        // }
        Meteor.call('bots.updateState', this.settings._id, 'initializationDone', (error) => {
          if (error) {
            throw new Meteor.Error('initializationDone error', error);
          }
        });
      });
    }
  }
}

module.exports = BotState;
