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
const {cyan, red, yellow} = require('kleur/colors');
const {getLoggingPrefix, logWithoutTimestamp} = require('../common/logging');
const {gitDiffColor, gitDiffNameOnly} = require('../common/git');

/**
 * Makes sure package.json and package-lock.json are in sync.
 * @return {boolean}
 */
function isPackageLockFileInSync() {
  const loggingPrefix = getLoggingPrefix();
  const results = checkDependencies.sync({
    verbose: true,
    log: () => {},
    error: console.log,
  });
  if (!results.depsWereOk) {
    logWithoutTimestamp(
      loggingPrefix,
      red('ERROR:'),
      'Updates to',
      cyan('package.json'),
      'must be accompanied by a corresponding update to',
      cyan('package-lock.json')
    );
    logWithoutTimestamp(
      loggingPrefix,
      yellow('NOTE:'),
      'To update',
      cyan('package-lock.json'),
      'after changing',
      cyan('package.json') + ',',
      'run',
      '"' + cyan('npm install') + '"',
      'and include the updated',
      cyan('package-lock.json'),
      'in your PR.'
    );
    return false;
  }
  return true;
}

/**
 * Makes sure that package-lock.json was properly updated.
 * @return {boolean}
 */
function isPackageLockFileProperlyUpdated() {
  const filesChanged = gitDiffNameOnly();
  const loggingPrefix = getLoggingPrefix();

  if (filesChanged.includes('package-lock.json')) {
    logWithoutTimestamp(
      loggingPrefix,
      red('ERROR:'),
      'This PR did not properly update',
      cyan('package-lock.json') + '.'
    );
    logWithoutTimestamp(
      loggingPrefix,
      yellow('NOTE:'),
      'To fix this, sync your branch to',
      cyan('upstream/master') + ', run',
      cyan('gulp update-packages') +
        ', and push a new commit containing the changes.'
    );
    logWithoutTimestamp(loggingPrefix, 'Expected changes:');
    logWithoutTimestamp(gitDiffColor());
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
