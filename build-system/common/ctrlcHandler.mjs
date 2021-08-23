import {cyan, green} from 'kleur/colors';
import {exec, execScriptAsync} from './exec.mjs';
import {logLocalDev} from './logging.mjs';

const killCmd = process.platform == 'win32' ? 'taskkill /f /pid' : 'kill -KILL';
const killSuffix = process.platform == 'win32' ? '>NUL' : '';

/**
 * Creates an async child process that handles Ctrl + C and immediately cancels
 * the ongoing `amp` task.
 *
 * @param {string} command
 * @return {number}
 */
export function createCtrlcHandler(command) {
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
}

/**
 * Exits the Ctrl C handler process.
 *
 * @param {string|number} handlerProcess
 */
export function exitCtrlcHandler(handlerProcess) {
  const exitCmd = killCmd + ' ' + handlerProcess + ' ' + killSuffix;
  exec(exitCmd);
}
