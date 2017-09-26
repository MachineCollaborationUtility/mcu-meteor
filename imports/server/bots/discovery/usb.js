import { Meteor } from 'meteor/meteor';
import bluebird from 'bluebird';
import * as presets from '../../../botPresets/**/index.js';
import { Bots } from '../../../api/bots';

let usb;
let SerialPort;

if (process.env.NODE_ENV !== 'test') {
  usb = bluebird.promisifyAll(require('usb'));
  SerialPort = require('serialport');
}

const _ = require('lodash');
// const Bot = require('../bot');

class UsbDiscovery {
  constructor() {
    // this.botPresetList = app.context.bots.botPresetList;
    this.ports = {};
  }

  substituteSerialNumberForPnpId(port) {
    if (port.pnpId === undefined) {
      if (port.serialNumber !== undefined) {
        port.pnpId = port.serialNumber;
      }
    }
    return port;
  }

  async initialize() {
    usb.on('attach', async () => {
      // Need to wait arbitrary amount of time for Serialport list to update
      await bluebird.delay(1000);
      SerialPort.list((err, ports) => {
        ports = ports.map(this.substituteSerialNumberForPnpId);
        // Compare every available port against every known port
        for (const port of ports) {
          // Ignore ports with undefined vid pids
          if (port.vendorId !== undefined && port.productId !== undefined) {
            // If the port isn't on our list of known ports, then we need to add it
            if (this.ports[port.comName] === undefined) {
              this.ports[port.comName] = port;
              this.detectPort(port);
            }
          }
        }
      });
    });

    usb.on('detach', async () => {
      // Need to wait arbitrary amount of time for Serialport list to update
      await bluebird.delay(1000);
      const portsToRemove = [];
      SerialPort.list(async (err, ports) => {
        ports = ports.map(this.substituteSerialNumberForPnpId);
        // Go through every known port
        for (const [portKey, listedPort] of _.entries(this.ports)) {
          const foundPort = ports.find(
            port =>
              port.comName === listedPort.comName &&
              port.vendorId !== undefined &&
              port.productId !== undefined,
          );

          // If the listedPort isn't in the serial port's available ports
          // we know that that port was removed
          // Now do all the steps to remove it
          if (!foundPort) {
            const bots = Bots.find().fetch();
            const removedBot = _.find(bots, bot => bot.endpoint === listedPort.pnpId);
            if (removedBot !== undefined) {
              portsToRemove.push(portKey);
              Meteor.call('bots.command', removedBot._id, 'unplug', (error) => {
                if (error) {
                  throw new Meteor.Error('Unplug error', error);
                }
              });
            }
          }
        }
        // Need to remove the port after cycling through the for loop
        for (const port of portsToRemove) {
          delete this.ports[port];
        }
      });
    });

    // Scan through all known serial ports and check if any of them are bots
    SerialPort.list((err, ports) => {
      ports = ports.map(this.substituteSerialNumberForPnpId);
      for (const port of ports) {
        if (port.vendorId !== undefined && port.productId !== undefined) {
          // Add each known serial port to the list
          // Even if we don't want to use a ports, we need to add it to a list of known ports
          // so that when a port is unplugged later, we can reference the list of known ports
          // against the list of available ports, and determine which port was unplugged
          this.ports[port.comName] = port;
          this.detectPort(port);
        }
      }
    });
  }

  async detectPort(port) {
    const vid = parseInt(port.vendorId, 16);
    const pid = parseInt(port.productId, 16);

    for (const [botPresetKey, botPreset] of _.entries(presets)) {
      if (botPreset.info.connectionType === 'serial') {
        for (const vidPid of botPreset.info.vidPid) {
          // Don't process a greedy, undefined vid pid
          if (vidPid.vid === -1 && vidPid.pidlin === -1) {
            return;
          }

          // Allow printers to ignore the vendor id or product id by setting to -1
          if (
            (vid === vidPid.vid || vidPid.vid === -1) &&
            (pid === vidPid.pid || vidPid.pid === -1)
          ) {
            // Pass the detected preset to populate new settings
            const bot = this.checkForPersistentSettings(port, botPreset);
            Meteor.call('bots.command', bot._id, 'discover', (error) => {
              if (error) {
                throw new Meteor.Error(error);
              }
            });
          }
        }
      }
    }
  }

  // compare the bot's pnpId with all of the bots in our database
  // if a pnpId exists, lost the bot with those settings, otherwise pull from a generic bot
  checkForPersistentSettings(port, botPreset) {
    try {
      const availableBots = Bots.find().fetch();

      const savedDbProfile = availableBots.find(bot => port.pnpId && bot.endpoint === port.pnpId);
      if (savedDbProfile) {
        return savedDbProfile;
      }

      // If pnpid or serial number, need to add it to the database
      // else set port to port
      if (port.pnpId !== undefined) {
        const newSettings = Object.assign({}, botPreset.settings);
        newSettings.endpoint = port.pnpId;
        const newBot = Meteor.call('bots.insert', newSettings);
        return newBot;
      }
    } catch (ex) {
      throw new Meteor.Error('Persistent Bot Check error', ex);
    }
  }
}

export default new UsbDiscovery();
