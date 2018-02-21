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

const colors = require('ansi-colors');
const exec = require('./exec').exec;
const execAsync = require('./exec').execAsync;
const log = require('fancy-log');

const green = colors.green;
const cyan = colors.cyan;

const killCmd =
    (process.platform == 'win32') ? 'taskkill /pid' : 'kill -KILL';

/**
 * Creates an async child process that handles Ctrl + C and immediately cancels
 * the ongoing `gulp watch | build | dist` task.
 *
 * @param {string} command
 */
exports.createCtrlcHandler = function(command) {
  if (!process.env.TRAVIS) {
    log(green('Running'), cyan(command) + green('. Press'), cyan('Ctrl + C'),
        green('to cancel...'));
  }
  const killMessage = green('\nDetected ') + cyan('Ctrl + C') +
      green('. Canceling ') + cyan(command) + green('.');
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
  return execAsync(
      listenerCmd, {'stdio': [null, process.stdout, process.stderr]}).pid;
};

/**
 * Exits the Ctrl C handler process.
 *
 * @param {string} handlerProcess
 */
exports.exitCtrlcHandler = function(handlerProcess) {
  const exitCmd = killCmd + ' ' + handlerProcess;
  exec(exitCmd);
};
