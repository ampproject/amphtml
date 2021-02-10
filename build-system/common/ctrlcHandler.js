/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const colors = require('kleur/colors');
const {execScriptAsync, exec} = require('./exec');
const {logLocalDev} = require('./logging');

const {green, cyan} = colors;

const killCmd = process.platform == 'win32' ? 'taskkill /f /pid' : 'kill -KILL';
const killSuffix = process.platform == 'win32' ? '>NUL' : '';

/**
 * Creates an async child process that handles Ctrl + C and immediately cancels
 * the ongoing `gulp` task.
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
 * @param {string} handlerProcess
 */
exports.exitCtrlcHandler = function (handlerProcess) {
  const exitCmd = killCmd + ' ' + handlerProcess + ' ' + killSuffix;
  exec(exitCmd);
};
