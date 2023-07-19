'use strict';

/**
 * @fileoverview Provides functions for executing tasks in a child process.
 */

const childProcess = require('child_process');
const {log} = require('./logging');
const {red} = require('kleur/colors');
const {spawnProcess} = require('./process');

const shellCmd = process.platform == 'win32' ? 'cmd' : '/bin/bash';

/**
 * Executes the provided command with the given options, returning the process
 * object.
 *
 * @param {string} cmd
 * @param {?Object=} options
 * @return {!Object}
 */
function exec(cmd, options = {'stdio': 'inherit'}) {
  return spawnProcess(cmd, options);
}

/**
 * Executes the provided shell script in an asynchronous process. Special-cases
 * the AMP task runner so that it is correctly spawned on all platforms (node
 * shebangs do not work on Windows).
 *
 * @param {string} script
 * @param {?Object} options
 * @return {!childProcess.ChildProcessWithoutNullStreams}
 */
function execScriptAsync(script, options) {
  const scriptToSpawn = script.startsWith('amp ') ? `node ${script}` : script;
  return childProcess.spawn(scriptToSpawn, {shell: shellCmd, ...options});
}

/**
 * Executes the provided command, and terminates the program in case of failure.
 *
 * @param {string} cmd
 * @param {?Object=} options
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
    log(red('ERROR:'), msg);
    const error = new Error(p.stderr);
    error.status = p.status;
    throw error;
  }
  return p;
}

module.exports = {
  exec,
  execOrDie,
  execScriptAsync,
  execWithError,
  execOrThrow,
};
