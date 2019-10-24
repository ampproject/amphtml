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
const {gitDiffNameOnlyMaster} = require('../common/git');
const {green, cyan} = require('ansi-colors');
const {isTravisBuild} = require('../common/travis');

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
  return gitDiffNameOnlyMaster().filter(changedFile => {
    return fs.existsSync(changedFile) && allFiles.includes(changedFile);
  });
}

/**
 * Logs the list of files that will be checked.
 *
 * @param {!Array<string>} files
 */
function logFiles(files) {
  if (!isTravisBuild()) {
    log(green('INFO: ') + 'Checking the following files:');
    files.forEach(file => {
      log(cyan(file));
    });
  }
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
  let filesToCheck = [];
  if (argv.files) {
    filesToCheck = globby.sync(argv.files.split(','));
    logFiles(filesToCheck);
  } else if (argv.local_changes) {
    filesToCheck = getFilesChanged(globs);
    if (filesToCheck.length == 0) {
      log(green('INFO: ') + 'No files to check in this PR');
    } else {
      logFiles(filesToCheck);
    }
  } else {
    filesToCheck = globby.sync(globs, options);
  }
  return filesToCheck;
}

module.exports = {
  getFilesChanged,
  getFilesToCheck,
  logOnSameLine,
};
