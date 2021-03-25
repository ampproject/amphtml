/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview This is a lightweight task runner with a one-file implentation
 * based on the commander npm package.
 */

const argv = require('minimist')(process.argv.slice(2));
const commander = require('commander');
const fs = require('fs-extra');
const path = require('path');
const {
  updatePackages,
  updateSubpackages,
} = require('../common/update-packages');
const {cyan, red, green, magenta, yellow} = require('kleur/colors');
const {isCiBuild} = require('../common/ci');
const {log, logWithoutTimestamp} = require('../common/logging');

/**
 * Special-case constant that indicates if `amp --help` was invoked.
 */
const isHelpTask = argv._.length == 0 && argv.hasOwnProperty('help');

/**
 * Calculates and formats the duration for which an AMP task ran.
 * @param {DOMHighResTimeStamp} start
 * @return {string}
 */
function getTime(start) {
  const endTime = Date.now();
  const executionTime = endTime - start;
  const mins = Math.floor(executionTime / 60000);
  const secs = Math.floor((executionTime % 60000) / 1000);
  const msecs = executionTime % 1000;
  return mins !== 0
    ? `${mins}m ${secs}s`
    : secs != 0
    ? `${secs}s`
    : `${msecs}ms`;
}

/**
 * Switches the current directory to the repo root if needed. This is done so
 * that hard-coded paths within tasks can work predictably.
 */
function startAtRepoRoot() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  if (repoRoot != process.cwd()) {
    process.chdir(repoRoot);
    log('Working directory changed to', magenta('amphtml'));
  }
}

/**
 * Updates task-specific subpackages if there are any.
 * @param {string} taskSourceFilePath
 * @return {Promise<void>}
 */
async function maybeUpdateSubpackages(taskSourceFilePath) {
  const packageFile = path.join(taskSourceFilePath, 'package.json');
  const hasSubpackages = await fs.pathExists(packageFile);
  if (hasSubpackages) {
    await updateSubpackages(taskSourceFilePath);
  }
}

/**
 * Runs an AMP task with logging and timing after installing its subpackages.
 * @param {string} taskName
 * @param {string} taskSourceFilePath
 * @param {Function()} taskFunc
 * @return {Promise<void>}
 */
async function runTask(taskName, taskSourceFilePath, taskFunc) {
  log('Using task file', magenta(path.join('amphtml', 'amp.js')));
  const start = Date.now();
  try {
    log(`Starting '${cyan(taskName)}'...`);
    await maybeUpdateSubpackages(taskSourceFilePath);
    await taskFunc();
    log('Finished', `'${cyan(taskName)}'`, 'after', magenta(getTime(start)));
  } catch (err) {
    log(`'${cyan(taskName)}'`, red('errored after'), magenta(getTime(start)));
    log(err);
    process.exit(1);
  }
}

/**
 * Helper that creates the tasks in AMP's toolchain based on the invocation:
 * - For `amp --help`, load all task descriptions so a list can be printed.
 * - For `amp <task> --help`, load and print just the task description + flags.
 * - When a task is actually run, update root packages, load the entry point,
 *   validate usage, update task-specific packages, and run the task.
 * @param {string} taskName
 * @param {string} taskFuncName
 * @param {string} taskSourceFileName
 */
function createTask(taskName, taskFuncName, taskSourceFileName) {
  const taskSourceFilePath = path.join(__dirname, taskSourceFileName);
  const isInvokedTask = argv._.includes(taskName); // `amp <task>`
  const isDefaultTask =
    argv._.length === 0 && taskName == 'default' && !isHelpTask; // `amp`
  const isTaskLevelHelp =
    (isInvokedTask || isDefaultTask) && argv.hasOwnProperty('help'); // `amp <task> --help`

  if (isHelpTask) {
    const taskFunc = require(taskSourceFilePath)[taskFuncName];
    const task = commander.command(cyan(taskName));
    task.description(taskFunc.description);
  }
  if (isInvokedTask || isDefaultTask) {
    if (!isTaskLevelHelp && !isCiBuild()) {
      startAtRepoRoot();
      updatePackages();
    }
    const taskFunc = require(taskSourceFilePath)[taskFuncName];
    const task = commander.command(taskName, {isDefault: isDefaultTask});
    task.description(green(taskFunc.description));
    task.allowUnknownOption(); // Fall through to validateUsage()
    task.helpOption('--help', 'Print this list of flags');
    task.usage('<flags>');
    for (const [flag, description] of Object.entries(taskFunc.flags ?? {})) {
      task.option(`--${cyan(flag)}`, description);
    }
    task.action(async () => {
      validateUsage(task, taskName, taskFunc);
      await runTask(taskName, taskSourceFilePath, taskFunc);
    });
  }
}

/**
 * Validates usage by examining task and flag invocation.
 * @param {Object} task
 * @param {string} taskName
 * @param {function} taskFunc
 */
function validateUsage(task, taskName, taskFunc) {
  const tasks = argv._;
  const invalidTasks = tasks.filter((task) => task != taskName);

  const flags = Object.keys(argv).slice(1); // Everything after '_'
  const validFlags = taskFunc.flags ? Object.keys(taskFunc.flags) : [];
  const invalidFlags = flags.filter((flag) => !validFlags.includes(flag));

  if (invalidTasks.length > 0 || invalidFlags.length > 0) {
    task.addHelpText('before', red('ERROR: ') + 'Invalid usage');
    task.help({error: true});
  }
}

/**
 * Finalizes the task runner by doing special-case setup for `amp --help`,
 * parsing the invoked command, and printing an error message if an unknown task
 * was called.
 */
function finalizeRunner() {
  commander.addHelpCommand(false); // We already have `amp --help` and `amp <task> --help`
  if (isHelpTask) {
    commander.helpOption('--help', 'Print this list of tasks');
    commander.usage('<task> <flags>');
  }
  commander.on('command:*', (args) => {
    log(red('ERROR:'), 'Unknown task', cyan(args.join(' ')));
    log('⤷ Run', cyan('amp --help'), 'for a full list of tasks.');
    log('⤷ Run', cyan('amp <task> --help'), 'for help with a specific task.');
    process.exitCode = 1;
  });
  commander.parse();
}

/**
 * Prints a deprecation notice for the gulp task runner.
 * @param {boolean} withTimestamps
 */
function printGulpDeprecationNotice(withTimestamps) {
  const logFunc = withTimestamps ? log : logWithoutTimestamp;
  logFunc(yellow('=*='.repeat(25)));
  logFunc(yellow('DEPRECATION NOTICE:'));
  logFunc(
    'All',
    cyan('gulp'),
    'tasks have been replaced by an identical set of',
    cyan('amp'),
    'tasks.'
  );
  logFunc('⤷ Run', cyan('amp --help'), 'for a full list of tasks.');
  logFunc(
    '⤷ Run',
    cyan('amp <command> --help'),
    'for help with a specific task.'
  );
  logFunc(
    '⤷ See',
    cyan('contributing/TESTING.md#testing-commands'),
    'for more info.'
  );
  logFunc(yellow('=*='.repeat(25)));
}

module.exports = {
  createTask,
  finalizeRunner,
  printGulpDeprecationNotice,
};
