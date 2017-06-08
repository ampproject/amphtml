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

var child_process = require('child_process');
var util = require('gulp-util');

/**
 * Spawns the given command in a child process with the given options.
 *
 * @param {string} cmd
 * @param {<Object>} options
 * @return {<Object>} Process info.
 */
function spawnProcess(cmd, options){
  return child_process.spawnSync('/bin/sh', ['-c', cmd], options);
}

/**
 * Executes the provided command, and prints a message if the command fails.
 *
 * @param {string} cmd Command line to execute.
 */
exports.exec = function(cmd) {
  const p = spawnProcess(cmd, {'stdio': 'inherit'});
  if (p.status != 0) {
    console/*OK*/.log(util.colors.yellow('\nCommand failed: ' + cmd));
  }
}

/**
 * Executes the provided command, and terminates the program in case of failure.
 *
 * @param {string} cmd Command line to execute.
 */
exports.execOrDie = function(cmd) {
  const p = spawnProcess(cmd, {'stdio': 'inherit'});
  if (p.status != 0) {
    console/*OK*/.error(util.colors.red('\nCommand failed: ' + cmd));
    process.exit(p.status)
  }
}

/**
 * Executes the provided command, returning its stdout.
 * This will throw an exception if something goes wrong.
 * @param {string} cmd
 * @return {!Array<string>}
 */
exports.getStdout = function(cmd) {
  const p = spawnProcess(
      cmd,
      {
        'cwd': process.cwd(),
        'env': process.env,
        'stdio': 'pipe',
        'encoding': 'utf-8'
      });
  return p.stdout;
}
