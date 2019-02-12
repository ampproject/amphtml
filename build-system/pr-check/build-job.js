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
 * @fileoverview This file is executed by Travis (configured via
 * .travis.yml in the root directory) and is the main driver script
 * for running tests.  Execution herein is entirely synchronous, that
 * is, commands are executed on after the other (see the exec
 * function). Should a command fail, this script will then also fail.
 * This script attempts to introduce some granularity for our
 * presubmit checking, via the determineBuildTargets method.
 */
const colors = require('ansi-colors');
const command = require('./command');
const {
  determineBuildTargets,
  isFlagConfig,
} = require('./build-target');
const {
  gitBranchName,
  gitDiffColor,
  gitDiffCommitLog,
  gitDiffNameOnlyMaster,
  gitDiffStatMaster,
  gitMergeBaseMaster,
  gitTravisMasterBaseline,
  shortSha,
} = require('../git');
const {
  isTravisBuild,
  isTravisPullRequestBuild,
  isTravisPushBuild,
  travisPullRequestSha,
} = require('../travis');

const {getStderr} = require('../exec');

const fileLogPrefix = colors.bold(colors.yellow(fileName));
const fileName = 'build-job.js';
/**
 * Starts a timer to measure the execution time of the given function.
 * @param {string} functionName
 * @return {DOMHighResTimeStamp}
 */
function startTimer(functionName) {
  const startTime = Date.now();
  console.log(
      '\n' + fileLogPrefix, 'Running', colors.cyan(functionName) + '...');
  return startTime;
}

/**
 * Stops the timer for the given function and prints the execution time.
 * @param {string} functionName
 * @param {DOMHighResTimeStamp} startTime
 * @return {number}
 */
function stopTimer(functionName, startTime) {
  const endTime = Date.now();
  const executionTime = new Date(endTime - startTime);
  const mins = executionTime.getMinutes();
  const secs = executionTime.getSeconds();
  console.log(
      fileLogPrefix, 'Done running', colors.cyan(functionName),
      'Total time:', colors.green(mins + 'm ' + secs + 's'));
}

/**
 * Prints a summary of files changed by, and commits included in the PR.
 */
function printChangeSummary() {
  if (isTravisBuild()) {
    console.log(fileLogPrefix, colors.cyan('origin/master'),
        'is currently at commit',
        colors.cyan(shortSha(gitTravisMasterBaseline())));
    console.log(fileLogPrefix,
        'Testing the following changes at commit',
        colors.cyan(shortSha(travisPullRequestSha())));
  }

  const filesChanged = gitDiffStatMaster();
  console.log(filesChanged);

  const branchPoint = gitMergeBaseMaster();
  console.log(fileLogPrefix, 'Commit log since branch',
      colors.cyan(gitBranchName()), 'was forked from',
      colors.cyan('master'), 'at', colors.cyan(shortSha(branchPoint)) + ':');
  console.log(gitDiffCommitLog() + '\n');
}

/**
 * Makes sure package.json and yarn.lock are in sync.
 */
function runYarnIntegrityCheck() {
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
    process.exit(1);
  }
}

/**
 * Makes sure that yarn.lock was properly updated.
 */
function runYarnLockfileCheck() {
  const localChanges = gitDiffColor();
  if (localChanges.includes('yarn.lock')) {
    console.error(fileLogPrefix, colors.red('ERROR:'),
        'This PR did not properly update', colors.cyan('yarn.lock') + '.');
    console.error(fileLogPrefix, colors.yellow('NOTE:'),
        'To fix this, sync your branch to', colors.cyan('upstream/master') +
        ', run', colors.cyan('gulp update-packages') +
        ', and push a new commit containing the changes.');
    console.error(fileLogPrefix, 'Expected changes:');
    console.log(localChanges);
    process.exit(1);
  }
}

/**
 * The main method for the script execution which much like a C main function
 * receives the command line arguments and returns an exit status.
 * @return {number}
 */
function main() {
  const startTime = startTimer(fileName);

  // Make sure package.json and yarn.lock are in sync and up-to-date.
  runYarnIntegrityCheck();
  runYarnLockfileCheck();

  console.log(
      fileLogPrefix, 'Running build shard',
      colors.cyan(process.env.BUILD_SHARD),
      '\n');

  printChangeSummary();
  const files = gitDiffNameOnlyMaster();
  const buildTargets = determineBuildTargets(files);

  // Exit early if flag-config files are mixed with runtime files.
  if (buildTargets.has('FLAG_CONFIG') && buildTargets.has('RUNTIME')) {
    console.log(fileLogPrefix, colors.red('ERROR:'),
        'Looks like your PR contains',
        colors.cyan('{prod|canary}-config.json'),
        'in addition to some other files.  Config and code are not kept in',
        'sync, and config needs to be backwards compatible with code for at',
        'least two weeks.  See #8188');
    const nonFlagConfigFiles = files.filter(file => !isFlagConfig(file));
    console.log(fileLogPrefix, colors.red('ERROR:'),
        'Please move these files to a separate PR:',
        colors.cyan(nonFlagConfigFiles.join(', ')));
    stopTimer(fileName, startTime);
    process.exit(1);
  }

  console.log(
      fileLogPrefix, 'Detected build targets:',
      colors.cyan(Array.from(buildTargets).sort().join(', ')));

  if (isTravisPullRequestBuild()) {
    command.updatePackages();
    if (buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('RUNTIME')) {
      command.testBuildSystem();
    }
  } else if (isTravisPushBuild()) {
    command.updatePackages();
    command.testBuildSystem();
    command.cleanBuild();
    command.buildRuntime();
  }

  stopTimer(fileName, startTime);
  return 0;
}

process.exit(main());
