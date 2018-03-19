/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

/**
 * @fileoverview Provides functions for executing tasks in a child process.
 */

const childProcess = require('child_process');

const shellCmd = (process.platform == 'win32') ? 'cmd' : '/bin/sh';
const shellFlag = (process.platform == 'win32') ? '/C' : '-c';

/**
 * Spawns the given command in a child process with the given options.
 *
 * @param {string} cmd
 * @param {<Object>} options
 * @return {<Object>} Process info.
 */
function spawnProcess(cmd, options) {
  return childProcess.spawnSync(shellCmd, [shellFlag, cmd], options);
}

/**
 * Executes the provided command, returning the process object.
 *
 * @param {string} cmd Command line to execute.
 * @return {<Object>} Process info.
 */
exports.exec = function(cmd) {
  return spawnProcess(cmd, {'stdio': 'inherit'});
};

/**
 * Executes the provided shell script in an asynchronous process.
 *
 * @param {string} script
 * @param {<Object>} options
 */
exports.execScriptAsync = function(script, options) {
  return childProcess.spawn('sh', ['-c', script], options);
};

/**
 * Executes the provided command, and terminates the program in case of failure.
 *
 * @param {string} cmd Command line to execute.
 */
exports.execOrDie = function(cmd) {
  const p = spawnProcess(cmd, {'stdio': 'inherit'});
  if (p.status != 0) {
    process.exit(p.status);
  }
};

/**
 * Executes the provided command, returning the process object.
 * This will throw an exception if something goes wrong.
 * @param {string} cmd
 * @return {!Object}
 */
function getOutput(cmd) {
  const p = spawnProcess(
      cmd,
      {
        'cwd': process.cwd(),
        'env': process.env,
        'stdio': 'pipe',
        'encoding': 'utf-8',
      });
  return p;
}

/**
 * Executes the provided command, returning its stdout.
 * @param {string} cmd
 * @return {string}
 */
exports.getStdout = function(cmd) {
  return getOutput(cmd).stdout;
};

/**
 * Executes the provided command, returning its stderr.
 * @param {string} cmd
 * @return {string}
 */
exports.getStderr = function(cmd) {
  return getOutput(cmd).stderr;
};
