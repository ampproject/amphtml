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

const fs = require('fs-extra');
const {
  ciPullRequestSha,
  circleciBuildNumber,
  isCiBuild,
  isCircleciBuild,
} = require('../common/ci');
const {
  gitBranchCreationPoint,
  gitBranchName,
  gitCommitHash,
  gitDiffCommitLog,
  gitDiffStatMain,
  gitCiMainBaseline,
  shortSha,
} = require('../common/git');
const {cyan, green, yellow} = require('../common/colors');
const {execOrDie, execOrThrow, execWithError, exec} = require('../common/exec');
const {getLoggingPrefix, logWithoutTimestamp} = require('../common/logging');
const {replaceUrls} = require('../tasks/pr-deploy-bot-utils');

const UNMINIFIED_CONTAINER_DIRECTORY = 'unminified';
const NOMODULE_CONTAINER_DIRECTORY = 'nomodule';
const MODULE_CONTAINER_DIRECTORY = 'module';

const ARTIFACT_FILE_NAME = '/tmp/artifacts/amp_nomodule_build.tar.gz';

const BUILD_OUTPUT_DIRS = ['build', 'dist', 'dist.3p'];
const APP_SERVING_DIRS = [
  ...BUILD_OUTPUT_DIRS,
  'dist.tools',
  'examples',
  'test/manual',
  'test/fixtures/e2e',
];

const GIT_BRANCH_URL =
  'https://github.com/ampproject/amphtml/blob/main/docs/getting-started-e2e.md#create-a-git-branch';

/**
 * Prints a summary of files changed by, and commits included in the PR.
 */
function printChangeSummary() {
  const loggingPrefix = getLoggingPrefix();
  let commitSha;

  if (isCiBuild()) {
    logWithoutTimestamp(
      `${loggingPrefix} Latest commit from ${cyan('main')} included ` +
        `in this build: ${cyan(shortSha(gitCiMainBaseline()))}`
    );
    commitSha = ciPullRequestSha();
  } else {
    commitSha = gitCommitHash();
  }
  logWithoutTimestamp(
    `${loggingPrefix} Testing the following changes at commit ` +
      `${cyan(shortSha(commitSha))}`
  );

  const filesChanged = gitDiffStatMain();
  logWithoutTimestamp(filesChanged);

  const branchCreationPoint = gitBranchCreationPoint();
  if (branchCreationPoint) {
    logWithoutTimestamp(
      `${loggingPrefix} Commit log since branch`,
      `${cyan(gitBranchName())} was forked from`,
      `${cyan('main')} at`,
      `${cyan(shortSha(branchCreationPoint))}:`
    );
    logWithoutTimestamp(gitDiffCommitLog() + '\n');
  } else {
    logWithoutTimestamp(
      loggingPrefix,
      yellow('WARNING:'),
      'Could not find a common ancestor for',
      cyan(gitBranchName()),
      'and',
      cyan('main') + '. (This can happen with older PR branches.)'
    );
    logWithoutTimestamp(
      loggingPrefix,
      yellow('NOTE 1:'),
      'If this causes unexpected test failures, try rebasing the PR branch on',
      cyan('main') + '.'
    );
    logWithoutTimestamp(
      loggingPrefix,
      yellow('NOTE 2:'),
      "If rebasing doesn't work, you may have to recreate the branch. See",
      cyan(GIT_BRANCH_URL) + '.\n'
    );
  }
}

/**
 * Signal to dependent jobs that they should be skipped. Uses an identifier that
 * corresponds to the current job to eliminate conflicts if a parallel job also
 * signals the same thing.
 *
 * Currently only relevant for CircleCI builds.
 */
function signalGracefulHalt() {
  if (isCircleciBuild()) {
    const loggingPrefix = getLoggingPrefix();
    const sentinelFile = `/tmp/workspace/.CI_GRACEFULLY_HALT_${circleciBuildNumber()}`;
    fs.closeSync(fs.openSync(sentinelFile, 'w'));
    logWithoutTimestamp(
      `${loggingPrefix} Created ${cyan(sentinelFile)} to signal graceful halt.`
    );
  }
}

/**
 * Prints a message indicating why a job was skipped and mark its dependent jobs
 * for skipping.
 * @param {string} jobName
 * @param {string} skipReason
 */
function skipDependentJobs(jobName, skipReason) {
  const loggingPrefix = getLoggingPrefix();
  logWithoutTimestamp(
    `${loggingPrefix} Skipping ${cyan(jobName)} because ${skipReason}.`
  );
  signalGracefulHalt();
}

/**
 * Starts a timer to measure the execution time of the given job / command.
 * @param {string} jobNameOrCmd
 * @return {DOMHighResTimeStamp}
 */
function startTimer(jobNameOrCmd) {
  const startTime = Date.now();
  const loggingPrefix = getLoggingPrefix();
  logWithoutTimestamp(
    '\n' + loggingPrefix,
    'Running',
    cyan(jobNameOrCmd) + '...'
  );
  return startTime;
}

/**
 * Stops the timer for the given job / command and prints the execution time.
 * @param {string} jobNameOrCmd
 * @param {DOMHighResTimeStamp} startTime
 */
function stopTimer(jobNameOrCmd, startTime) {
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  const mins = Math.floor(executionTime / 60000);
  const secs = Math.floor((executionTime % 60000) / 1000);
  const loggingPrefix = getLoggingPrefix();
  logWithoutTimestamp(
    loggingPrefix,
    'Done running',
    cyan(jobNameOrCmd),
    'Total time:',
    green(mins + 'm ' + secs + 's')
  );
}

/**
 * Aborts the process after stopping the timer for a given job
 * @param {string} jobName
 * @param {number} startTime
 */
function abortTimedJob(jobName, startTime) {
  stopTimer(jobName, startTime);
  process.exitCode = 1;
}

/**
 * Wraps an exec helper in a timer. Returns the result of the helper.
 * @param {function(string, string=): ?} execFn
 * @return {function(string, string=): ?}
 */
function timedExecFn(execFn) {
  return (cmd, ...rest) => {
    const startTime = startTimer(cmd);
    const p = execFn(cmd, ...rest);
    stopTimer(cmd, startTime);
    return p;
  };
}

/**
 * Executes the provided command and times it. Errors, if any, are printed.
 * @function
 * @param {string} cmd
 * @return {!Object} Node process
 */
const timedExec = timedExecFn(exec);

/**
 * Executes the provided command and times it. Errors, if any, are returned.
 * @function
 * @param {string} cmd
 * @return {!Object} Node process
 */
const timedExecWithError = timedExecFn(execWithError);

/**
 * Executes the provided command and times it. The program terminates in case of
 * failure.
 * @function
 * @param {string} cmd
 */
const timedExecOrDie = timedExecFn(execOrDie);

/**
 * Executes the provided command and times it. The program throws on error in
 * case of failure.
 * @function
 * @param {string} cmd
 */
const timedExecOrThrow = timedExecFn(execOrThrow);

/**
 * Stores build files to the CI workspace.
 * @param {string} containerDirectory
 * @private
 */
function storeBuildToWorkspace_(containerDirectory) {
  if (isCircleciBuild()) {
    fs.ensureDirSync(`/tmp/workspace/builds/${containerDirectory}`);
    for (const outputDir of BUILD_OUTPUT_DIRS) {
      fs.moveSync(
        `${outputDir}/`,
        `/tmp/workspace/builds/${containerDirectory}/${outputDir}`
      );
    }
  }
}

/**
 * Stores unminified build files to the CI workspace.
 */
function storeUnminifiedBuildToWorkspace() {
  storeBuildToWorkspace_(UNMINIFIED_CONTAINER_DIRECTORY);
}

/**
 * Stores nomodule build files to the CI workspace.
 */
function storeNomoduleBuildToWorkspace() {
  storeBuildToWorkspace_(NOMODULE_CONTAINER_DIRECTORY);
}

/**
 * Stores module build files to the CI workspace.
 */
function storeModuleBuildToWorkspace() {
  storeBuildToWorkspace_(MODULE_CONTAINER_DIRECTORY);
}

/**
 * Stores an experiment's build files to the CI workspace.
 * @param {string} exp one of 'experimentA', 'experimentB', or 'experimentC'.
 */
function storeExperimentBuildToWorkspace(exp) {
  storeBuildToWorkspace_(exp);
}

/**
 * Replaces URLS in HTML files, compresses and stores nomodule build in CI artifacts.
 */
async function processAndStoreBuildToArtifacts() {
  if (!isCircleciBuild()) {
    return;
  }

  await replaceUrls('test/manual');
  await replaceUrls('examples');

  const loggingPrefix = getLoggingPrefix();

  logWithoutTimestamp(
    `\n${loggingPrefix} Compressing ` +
      cyan(APP_SERVING_DIRS.join(', ')) +
      ' into ' +
      cyan(ARTIFACT_FILE_NAME) +
      '...'
  );
  execOrDie(`tar -czf ${ARTIFACT_FILE_NAME} ${APP_SERVING_DIRS.join('/ ')}/`);
  execOrDie(`du -sh ${ARTIFACT_FILE_NAME}`);
}

module.exports = {
  abortTimedJob,
  printChangeSummary,
  skipDependentJobs,
  startTimer,
  stopTimer,
  timedExec,
  timedExecOrDie,
  timedExecWithError,
  timedExecOrThrow,
  storeUnminifiedBuildToWorkspace,
  storeNomoduleBuildToWorkspace,
  storeModuleBuildToWorkspace,
  storeExperimentBuildToWorkspace,
  processAndStoreBuildToArtifacts,
};
