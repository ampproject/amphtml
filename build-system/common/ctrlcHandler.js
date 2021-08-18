const colors = require('./colors');
const {exec, execScriptAsync} = require('./exec');
const {logLocalDev} = require('./logging');

const {cyan, green} = colors;

const killCmd = process.platform == 'win32' ? 'taskkill /f /pid' : 'kill -KILL';
const killSuffix = process.platform == 'win32' ? '>NUL' : '';

/**
 * Creates an async child process that handles Ctrl + C and immediately cancels
 * the ongoing `amp` task.
 *
 * @param {string} command
 * @return {number}
 */
exports.createCtrlcHandler = function (command) {
  logLocalDev(
    green('Running'),
    cyan(command) + green('. Press'),
    cyan('Ctrl + C'),
    green('to cancel...')
  );
  const killMessage =
    green('\nDetected ') +
    cyan('Ctrl + C') +
    green('. Canceling ') +
    cyan(command) +
    green('.');
  const listenerCmd = `
    #!/bin/sh
    ctrlcHandler() {
      echo -e "${killMessage}"
      ${killCmd} ${process.pid}
      exit 1
    }
    trap 'ctrlcHandler' INT
    read _ # Waits until the process is terminated
  `;
  return execScriptAsync(listenerCmd, {
    'stdio': [null, process.stdout, process.stderr],
  }).pid;
};

/**
 * Exits the Ctrl C handler process.
 *
 * @param {string|number} handlerProcess
 */
exports.exitCtrlcHandler = function (handlerProcess) {
  const exitCmd = killCmd + ' ' + handlerProcess + ' ' + killSuffix;
  exec(exitCmd);
};
