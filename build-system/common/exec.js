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
const log = require('fancy-log');
const {yellow} = require('ansi-colors');

const shellCmd = process.platform == 'win32' ? 'cmd' : '/bin/bash';

/**
 * Spawns the given command in a child process with the given options.
 *
 * @param {string} cmd
 * @param {?Object} options
 * @return {!Object}
 */
function spawnProcess(cmd, options) {
  return childProcess.spawnSync(cmd, {shell: shellCmd, ...options});
}

/**
 * Executes the provided command with the given options, returning the process
 * object.
 *
 * @param {string} cmd
 * @param {?Object} options
 * @return {!Object}
 */
function exec(cmd, options) {
  options = options || {'stdio': 'inherit'};
  return spawnProcess(cmd, options);
}

/**
 * Executes the provided shell script in an asynchronous process.
 *
 * @param {string} script
 * @param {?Object} options
 * @return {!ChildProcess}
 */
function execScriptAsync(script, options) {
  return childProcess.spawn(script, {shell: shellCmd, ...options});
}

/**
 * Executes the provided command, and terminates the program in case of failure.
 *
 * @param {string} cmd
 * @param {?Object} options
 */
function execOrDie(cmd, options) {
  const p = exec(cmd, options);
  if (p.status && p.status != 0) {
    process.exit(p.status);
  }
}

/**
 * Executes the provided command, piping the parent process' stderr, updating
 * the error to process if stderr is not empty, and returns process object.
 * @param {string} cmd
 * @return {!Object}
 */
function execWithError(cmd) {
  const p = exec(cmd, {'stdio': ['inherit', 'inherit', 'pipe']});
  if (p.stderr.length > 0) {
    p.error = new Error(p.stderr.toString());
  }
  return p;
}

/**
 * Executes the provided command, piping the parent process' stderr, throwing
 * an error with the provided message the command fails, and returns the
 * process object.
 * @param {string} cmd
 * @param {string} msg
 * @return {!Object}
 */
function execOrThrow(cmd, msg) {
  const p = exec(cmd, {'stdio': ['inherit', 'inherit', 'pipe']});
  if (p.status && p.status != 0) {
    log(yellow('ERROR:'), msg);
    const error = new Error(p.stderr);
    error.status = p.status;
    throw error;
  }
  return p;
}

/**
 * Executes the provided command, returning the process object.
 * @param {string} cmd
 * @param {?Object} options
 * @return {!Object}
 */
function getOutput(cmd, options = {}) {
  const p = spawnProcess(cmd, {
    'cwd': options.cwd || process.cwd(),
    'env': options.env || process.env,
    'stdio': options.stdio || 'pipe',
    'encoding': options.encoding || 'utf-8',
  });
  return p;
}

/**
 * Executes the provided command, returning its stdout.
 * @param {string} cmd
 * @param {?Object} options
 * @return {string}
 */
function getStdout(cmd, options) {
  return getOutput(cmd, options).stdout;
}

/**
 * Executes the provided command, returning its stderr.
 * @param {string} cmd
 * @param {?Object} options
 * @return {string}
 */
function getStderr(cmd, options) {
  return getOutput(cmd, options).stderr;
}

module.exports = {
  exec,
  execOrDie,
  execScriptAsync,
  execWithError,
  execOrThrow,
  getOutput,
  getStderr,
  getStdout,
};
