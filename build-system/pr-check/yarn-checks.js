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
'use strict';

/**
 * @fileoverview
 * This script makes sure that package.json and yarn.lock
 * are in sync and up to date.
 */

const colors = require('ansi-colors');
const {getStderr} = require('../exec');
const {gitDiffColor} = require('../git');

/**
 * Makes sure package.json and yarn.lock are in sync.
 * @param {string} fileName
 * @return {boolean}
 */
function isYarnLockFileInSync(fileName = 'yarn-checks.js') {
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));
  const yarnIntegrityCheck = getStderr('yarn check --integrity').trim();
  if (yarnIntegrityCheck.includes('error')) {
    console.error(fileLogPrefix, colors.red('ERROR:'),
        'Found the following', colors.cyan('yarn'), 'errors:\n' +
        colors.cyan(yarnIntegrityCheck));
    console.error(fileLogPrefix, colors.red('ERROR:'),
        'Updates to', colors.cyan('package.json'),
        'must be accompanied by a corresponding update to',
        colors.cyan('yarn.lock'));
    console.error(fileLogPrefix, colors.yellow('NOTE:'),
        'To update', colors.cyan('yarn.lock'), 'after changing',
        colors.cyan('package.json') + ',', 'run',
        '"' + colors.cyan('yarn install') + '"',
        'and include the updated', colors.cyan('yarn.lock'),
        'in your PR.');
    return false;
  }
  return true;
}

/**
 * Makes sure that yarn.lock was properly updated.
 * @param {string} fileName
 * @return {boolean}
 */
function isYarnLockFileProperlyUpdated(fileName = 'yarn-checks.js') {
  const localChanges = gitDiffColor();
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));

  if (localChanges.includes('yarn.lock')) {
    console.error(fileLogPrefix, colors.red('ERROR:'),
        'This PR did not properly update', colors.cyan('yarn.lock') + '.');
    console.error(fileLogPrefix, colors.yellow('NOTE:'),
        'To fix this, sync your branch to', colors.cyan('upstream/master') +
        ', run', colors.cyan('gulp update-packages') +
        ', and push a new commit containing the changes.');
    console.error(fileLogPrefix, 'Expected changes:');
    console.log(localChanges);
    return false;
  }
  return true;
}

/**
 * Runs both yarn checks, and returns false if either one fails.
 * @param {string} filename
 * @return {boolean}
 */
function runYarnChecks(filename) {
  return isYarnLockFileInSync(filename) &&
      isYarnLockFileProperlyUpdated(filename);
}

module.exports = {
  runYarnChecks,
};
