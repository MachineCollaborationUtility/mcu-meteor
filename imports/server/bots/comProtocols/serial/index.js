/** *****************************************************************************
 * SerialCommandExecutor()
 *
 * Constructor for the SerialCommandExecutor.  The command queue requests to
 * open and close the connection, and while open sends command strings to be
 * executed.
 *
 * This class uses SerialConnection() to establish and maintain our connection
 * open.
 *
 * Args:   inComName      - com port to which to connect
 *         inBaud         - baud rate at which to connect
 *         inOpenPrimeStr - function a string of commands to send to prime the conn
 */
const _ = require('underscore');

const SerialConnection = require('./connection');

const SerialCommandExecutor = function ({ settings, info }) {
  this.settings = settings;
  this.info = info;
  this.mComName = inComName;
  this.mBaud = inBaud;
  this.mOpenPrimeStr = inOpenPrimeStr;
  this.mConnection = undefined;
  this.mCommandsProcessed = undefined;
  this.app = app;
  this.io = app.io;
  this.bot = bot;
};

/**
 * validator()
 *
 * Confirms if a reply contains 'ok' as its last line.  Parses out DOS newlines.
 *
 * Args:   reply - The reply from a bot after sending a command
 * Return: true if the last line was 'ok'
 */
SerialCommandExecutor.validator = function (command, reply) {
  const lines = reply.toString().split('\n');
  let ok;
  try {
    ok = _.last(lines).indexOf('ok') !== -1;
  } catch (ex) {
    logger.error('Bot validate serial reply error', reply, ex);
  }
  return ok;
};

/**
 * getCommandsProcessed()
 *
 * Accessor
 */
SerialCommandExecutor.prototype.getCommandsProcessed = function () {
  return this.mCommandsProcessed;
};

/**
 * open()
 *
 * The executor's open uses a SerialConnection object to establish a
 * stable connection.
 *
 * Args:   inDoneFunc - called when we complete our connection
 * Return: N/A
 */
SerialCommandExecutor.prototype.open = function (inDoneFunc) {
  this.mConnection = new SerialConnection(
    this.app,
    this.mComName,
    this.mBaud,
    this.mOpenPrimeStr,
    this.bot,
    (inData) => {
      // console.log('Serial Port Initial Data', inData);
    },
    () => {
      inDoneFunc(true);
    },
  );
  // ****** WHAT TO DO IF OPEN FAILS???? ********//
  this.mCommandsProcessed = 0;
};

/**
 * close()
 *
 * The executor simply closes any open port.
 *
 * Args:   inDoneFunc - called when we close our connection
 * Return: N/A
 */
SerialCommandExecutor.prototype.close = function (inDoneFunc) {
  const that = this;
  that.mConnection.close();
  inDoneFunc(true);
  that.mCommandsProcessed = undefined;
};

/**
 * execute()
 *
 * Send the requested command to the device, passing any response
 * data back for processing.
 *
 * Args:   inRawCode  - command to send
 *         inDataFunc - function to call with response data
 *         inDoneFunc - function to call if the command will have no response
 */
SerialCommandExecutor.prototype.execute = function (inRawCode, inDataFunc, inDoneFunc) {
  const that = this;

  that.mConnection.setDataFunc(inDataFunc);
  that.mConnection.send(inRawCode);
  that.mCommandsProcessed++;
};

module.exports = SerialCommandExecutor;
