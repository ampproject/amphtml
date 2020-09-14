/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const globby = require('globby');
const log = require('fancy-log');
const path = require('path');
const {clean} = require('../tasks/clean');
const {doBuild} = require('../tasks/build');
const {doDist} = require('../tasks/dist');
const {execOrDie} = require('./exec');
const {gitDiffNameOnlyMaster} = require('./git');
const {green, cyan, yellow} = require('ansi-colors');
const {isTravisBuild} = require('./travis');

const ROOT_DIR = path.resolve(__dirname, '../../');

/**
 * Performs a clean build of the AMP runtime in testing mode.
 * Used by `gulp e2e|integration|visual_diff`.
 */
async function buildRuntime() {
  await clean();
  if (argv.compiled) {
    await doDist({fortesting: true});
  } else {
    await doBuild({fortesting: true});
  }
}

/**
 * Logs a message on the same line to indicate progress
 *
 * @param {string} message
 */
function logOnSameLine(message) {
  if (!isTravisBuild() && process.stdout.isTTY) {
    process.stdout.moveCursor(0, -1);
    process.stdout.cursorTo(0);
    process.stdout.clearLine();
  }
  log(message);
}

/**
 * Gets the list of files changed on the current branch that match the given
 * array of glob patterns
 *
 * @param {!Array<string>} globs
 * @return {!Array<string>}
 */
function getFilesChanged(globs) {
  const allFiles = globby.sync(globs, {dot: true});
  return gitDiffNameOnlyMaster().filter((changedFile) => {
    return fs.existsSync(changedFile) && allFiles.includes(changedFile);
  });
}

/**
 * Logs the list of files that will be checked and returns the list.
 *
 * @param {!Array<string>} files
 * @return {!Array<string>}
 */
function logFiles(files) {
  if (!isTravisBuild()) {
    log(green('INFO: ') + 'Checking the following files:');
    for (const file of files) {
      log(cyan(file));
    }
  }
  return files;
}

/**
 * Extracts the list of files from argv.files.
 *
 * @return {Array<string>}
 */
function getFilesFromArgv() {
  // globby does not support Windows paths.
  const toPosix = str => str.replace(/\\\\?/g, '/');
  return argv.files
    ? globby.sync(argv.files.split(',').map((s) => s.trim()).map(toPosix))
    : [];
}

/**
 * Gets a list of files to be checked based on command line args and the given
 * file matching globs. Used by tasks like prettify, check-links, etc.
 *
 * @param {!Array<string>} globs
 * @param {Object=} options
 * @return {!Array<string>}
 */
function getFilesToCheck(globs, options = {}) {
  if (argv.files) {
    return logFiles(getFilesFromArgv());
  }
  if (argv.local_changes) {
    const filesChanged = getFilesChanged(globs);
    if (filesChanged.length == 0) {
      log(green('INFO: ') + 'No files to check in this PR');
      return [];
    }
    return logFiles(filesChanged);
  }
  return globby.sync(globs, options);
}

/**
 * Ensures that a target is only called with `--files` or `--local_changes`
 *
 * @param {string} taskName name of the gulp task.
 * @return {boolean} if the use is valid.
 */
function usesFilesOrLocalChanges(taskName) {
  const validUsage = argv.files || argv.local_changes;
  if (!validUsage) {
    log(
      yellow('NOTE 1:'),
      'It is infeasible for',
      cyan(`gulp ${taskName}`),
      'to check all files in the repo at once.'
    );
    log(
      yellow('NOTE 2:'),
      'Please run',
      cyan(`gulp ${taskName}`),
      'with',
      cyan('--files'),
      'or',
      cyan('--local_changes') + '.'
    );
  }
  return validUsage;
}

/**
 * Runs 'yarn' to install packages in a given directory.
 *
 * @param {string} dir
 */
function installPackages(dir) {
  log(
    'Running',
    cyan('yarn'),
    'to install packages in',
    cyan(path.relative(ROOT_DIR, dir)) + '...'
  );
  execOrDie(`npx yarn --cwd ${dir}`, {'stdio': 'ignore'});
}

module.exports = {
  buildRuntime,
  getFilesChanged,
  getFilesFromArgv,
  getFilesToCheck,
  installPackages,
  logOnSameLine,
  usesFilesOrLocalChanges,
};
