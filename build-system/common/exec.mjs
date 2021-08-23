/**
 * @fileoverview Provides functions for executing tasks in a child process.
 */

import childProcess from 'child_process';
import {log} from './logging.mjs';
import {red} from 'kleur/colors';
import {spawnProcess} from './process.mjs';

const shellCmd = process.platform == 'win32' ? 'cmd' : '/bin/bash';

/**
 * Executes the provided command with the given options, returning the process
 * object.
 *
 * @param {string} cmd
 * @param {?Object=} options
 * @return {!Object}
 */
export function exec(cmd, options = {'stdio': 'inherit'}) {
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
export function execScriptAsync(script, options) {
  const scriptToSpawn = script.startsWith('amp ') ? `node ${script}` : script;
  return childProcess.spawn(scriptToSpawn, {shell: shellCmd, ...options});
}

/**
 * Executes the provided command, and terminates the program in case of failure.
 *
 * @param {string} cmd
 * @param {?Object=} options
 */
export function execOrDie(cmd, options) {
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
export function execWithError(cmd) {
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
export function execOrThrow(cmd, msg) {
  const p = exec(cmd, {'stdio': ['inherit', 'inherit', 'pipe']});
  if (p.status && p.status != 0) {
    log(red('ERROR:'), msg);
    const error = new Error(p.stderr);
    error.status = p.status;
    throw error;
  }
  return p;
}
