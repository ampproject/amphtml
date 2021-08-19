'use strict';

/**
 * @fileoverview Provides functions for executing tasks in a child process.
 * Separated from `exec` to allow import before `npm` installs dependencies.
 */

const childProcess = require('child_process');

const shellCmd = process.platform == 'win32' ? 'cmd' : '/bin/bash';

/**
 * Spawns the given command in a child process with the given options.
 * Special-cases the AMP task runner so that it is correctly spawned on all
 * platforms (node shebangs do not work on Windows).
 *
 * @param {string} cmd
 * @param {?Object} options
 * @return {!Object}
 */
function spawnProcess(cmd, options) {
  const cmdToSpawn = cmd.startsWith('amp ') ? `node ${cmd}` : cmd;
  return childProcess.spawnSync(cmdToSpawn, {shell: shellCmd, ...options});
}

/**
 * Executes the provided command, returning the process object.
 * @param {string} cmd
 * @param {?Object=} options
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
 * @param {?Object=} options
 * @return {string}
 */
function getStdout(cmd, options) {
  return getOutput(cmd, options).stdout;
}

/**
 * Executes the provided command, returning its stderr.
 * @param {string} cmd
 * @param {?Object=} options
 * @return {string}
 */
function getStderr(cmd, options) {
  return getOutput(cmd, options).stderr;
}

module.exports = {
  getOutput,
  getStderr,
  getStdout,
  spawnProcess,
};
