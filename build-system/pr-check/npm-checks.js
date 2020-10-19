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
 * This script makes sure that package.json and package-lock.json are in sync
 * and up to date.
 */

const checkDependencies = require('check-dependencies');
const colors = require('ansi-colors');
const {gitDiffColor, gitDiffNameOnly} = require('../common/git');

/**
 * Makes sure package.json and package-lock.json are in sync.
 * @param {string} fileName
 * @return {boolean}
 */
function isPackageLockFileInSync(fileName) {
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));
  const results = checkDependencies.sync({
    verbose: true,
    log: () => {},
    error: console.log,
  });
  if (!results.depsWereOk) {
    console.error(
      fileLogPrefix,
      colors.red('ERROR:'),
      'Updates to',
      colors.cyan('package.json'),
      'must be accompanied by a corresponding update to',
      colors.cyan('package-lock.json')
    );
    console.error(
      fileLogPrefix,
      colors.yellow('NOTE:'),
      'To update',
      colors.cyan('package-lock.json'),
      'after changing',
      colors.cyan('package.json') + ',',
      'run',
      '"' + colors.cyan('npm install') + '"',
      'and include the updated',
      colors.cyan('package-lock.json'),
      'in your PR.'
    );
    return false;
  }
  return true;
}

/**
 * Makes sure that package-lock.json was properly updated.
 * @param {string} fileName
 * @return {boolean}
 */
function isPackageLockFileProperlyUpdated(fileName) {
  const filesChanged = gitDiffNameOnly();
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));

  if (filesChanged.includes('package-lock.json')) {
    console.error(
      fileLogPrefix,
      colors.red('ERROR:'),
      'This PR did not properly update',
      colors.cyan('package-lock.json') + '.'
    );
    console.error(
      fileLogPrefix,
      colors.yellow('NOTE:'),
      'To fix this, sync your branch to',
      colors.cyan('upstream/master') + ', run',
      colors.cyan('gulp update-packages') +
        ', and push a new commit containing the changes.'
    );
    console.error(fileLogPrefix, 'Expected changes:');
    console.log(gitDiffColor());
    return false;
  }
  return true;
}

/**
 * Runs both npm checks, and returns false if either one fails.
 * @param {string} filename
 * @return {boolean}
 */
function runNpmChecks(filename) {
  return (
    isPackageLockFileInSync(filename) &&
    isPackageLockFileProperlyUpdated(filename)
  );
}

module.exports = {
  runNpmChecks,
};
