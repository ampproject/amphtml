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

//TODO(estherkim): move to util file
const colors = require('ansi-colors');
const {
  gitBranchName,
  gitDiffColor,
  gitDiffCommitLog,
  gitDiffStatMaster,
  gitMergeBaseMaster,
  gitTravisMasterBaseline,
  shortSha,
} = require('../git');
const {
  isTravisBuild,
  travisPullRequestSha,
} = require('../travis');
const {determineBuildTargets} = require('./build-target');
const {getStderr} = require('../exec');
const {startTimer, stopTimer, timedExecOrDie, zipBuildOutput} = require('./utils');

const FILENAME = 'build.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));

/**
 * Prints a summary of files changed by, and commits included in the PR.
 */
function printChangeSummary_() {
  if (isTravisBuild()) {
    console.log(FILELOGPREFIX, colors.cyan('origin/master'),
        'is currently at commit',
        colors.cyan(shortSha(gitTravisMasterBaseline())));
    console.log(FILELOGPREFIX,
        'Testing the following changes at commit',
        colors.cyan(shortSha(travisPullRequestSha())));
  }

  const filesChanged = gitDiffStatMaster();
  console.log(filesChanged);

  const branchPoint = gitMergeBaseMaster();
  console.log(FILELOGPREFIX, 'Commit log since branch',
      colors.cyan(gitBranchName()), 'was forked from',
      colors.cyan('master'), 'at', colors.cyan(shortSha(branchPoint)) + ':');
  console.log(gitDiffCommitLog() + '\n');
}

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

function main() {
  const startTime = startTimer(FILENAME);

  // Make sure package.json and yarn.lock are in sync and up-to-date.
  runYarnIntegrityCheck_();
  runYarnLockfileCheck_();
  printChangeSummary_();
  const buildTargets = determineBuildTargets();

  if (buildTargets.has('RUNTIME') ||
        buildTargets.has('UNIT_TEST') ||
        buildTargets.has('INTEGRATION_TEST') ||
        buildTargets.has('BUILD_SYSTEM')) {

    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp css');
    timedExecOrDie('gulp build --fortesting');

    zipBuildOutput();
  } else {
    console.log('Skipping build job because this commit does ' +
     'not affect the runtime, build system, or test files');
  }

  stopTimer(FILENAME, startTime);
  return 0;
}

process.exit(main());

