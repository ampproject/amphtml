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
 * This script builds the AMP runtime.
 * This is run during the CI stage = build; job = build.
 */

const colors = require('ansi-colors');
const {
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase,
  uploadBuildOutput} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {getStderr} = require('../exec');
const {gitDiffColor} = require('../git');
const {isTravisPullRequestBuild} = require('../travis');
const FILENAME = 'build.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie =
  (cmd, unusedFileName) => timedExecOrDieBase(cmd, FILENAME);

/**
 * Makes sure package.json and yarn.lock are in sync.
 * @private
 */
function runYarnIntegrityCheck_() {
  const yarnIntegrityCheck = getStderr('yarn check --integrity').trim();
  if (yarnIntegrityCheck.includes('error')) {
    console.error(FILELOGPREFIX, colors.red('ERROR:'),
        'Found the following', colors.cyan('yarn'), 'errors:\n' +
        colors.cyan(yarnIntegrityCheck));
    console.error(FILELOGPREFIX, colors.red('ERROR:'),
        'Updates to', colors.cyan('package.json'),
        'must be accompanied by a corresponding update to',
        colors.cyan('yarn.lock'));
    console.error(FILELOGPREFIX, colors.yellow('NOTE:'),
        'To update', colors.cyan('yarn.lock'), 'after changing',
        colors.cyan('package.json') + ',', 'run',
        '"' + colors.cyan('yarn install') + '"',
        'and include the updated', colors.cyan('yarn.lock'),
        'in your PR.');
    process.exit(1);
  }
}

/**
 * Makes sure that yarn.lock was properly updated.
 * @private
 */
function runYarnLockfileCheck_() {
  const localChanges = gitDiffColor();
  if (localChanges.includes('yarn.lock')) {
    console.error(FILELOGPREFIX, colors.red('ERROR:'),
        'This PR did not properly update', colors.cyan('yarn.lock') + '.');
    console.error(FILELOGPREFIX, colors.yellow('NOTE:'),
        'To fix this, sync your branch to', colors.cyan('upstream/master') +
        ', run', colors.cyan('gulp update-packages') +
        ', and push a new commit containing the changes.');
    console.error(FILELOGPREFIX, 'Expected changes:');
    console.log(localChanges);
    process.exit(1);
  }
}

/**
 * Validate build targets.
 * Exit early if flag-config files are mixed with runtime files.
 * @param {!Set<string>} buildTargets
 * @return {boolean}
 * @private
 */
function areValidBuildTargets_(buildTargets) {
  if (buildTargets.has('FLAG_CONFIG') && buildTargets.has('RUNTIME')) {
    console.log(FILENAME, colors.red('ERROR:'),
        'Looks like your PR contains',
        colors.cyan('{prod|canary}-config.json'),
        'in addition to some other files.  Config and code are not kept in',
        'sync, and config needs to be backwards compatible with code for at',
        'least two weeks.  See #8188');
    return false;
  }
  return true;
}

function main() {
  const startTime = startTimer(FILENAME, FILENAME);

  // Make sure package.json and yarn.lock are in sync and up-to-date.
  runYarnIntegrityCheck_();
  runYarnLockfileCheck_();
  const buildTargets = determineBuildTargets();

  if (!areValidBuildTargets_(buildTargets)) {
    stopTimer(FILENAME, FILENAME, startTime);
    return 1;
  }

  if (!isTravisPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp build --fortesting');
    uploadBuildOutput(FILENAME);
  } else {
    printChangeSummary(FILENAME);
    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('UNIT_TEST') ||
        buildTargets.has('INTEGRATION_TEST') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('DEV_DASHBOARD') ||
        buildTargets.has('FLAG_CONFIG')) {

      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp build --fortesting');
      uploadBuildOutput(FILENAME);
    } else {
      uploadBuildOutput(FILENAME);
      console.log('Skipping build job because this commit does not affect ' +
          'the runtime, build system, test files, or the dev dashboard');
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
  return 0;
}

process.exit(main());

