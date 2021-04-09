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
  ciBuildSha,
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
const {cyan, green, yellow} = require('kleur/colors');
const {execOrDie, execOrThrow, execWithError, exec} = require('../common/exec');
const {getLoggingPrefix, logWithoutTimestamp} = require('../common/logging');
const {replaceUrls} = require('../tasks/pr-deploy-bot-utils');

const UNMINIFIED_CONTAINER_DIRECTORY = `unminified`;
const NOMODULE_CONTAINER_DIRECTORY = `nomodule`;
const MODULE_CONTAINER_DIRECTORY = `module`;

const UNMINIFIED_GCLOUD_OUTPUT_FILE = `amp_unminified_${ciBuildSha()}.zip`;
const NOMODULE_GCLOUD_OUTPUT_FILE = `amp_nomodule_${ciBuildSha()}.zip`;
const MODULE_GCLOUD_OUTPUT_FILE = `amp_module_${ciBuildSha()}.zip`;
const EXPERIMENT_GCLOUD_OUTPUT_FILE = (exp) => `amp_${exp}_${ciBuildSha()}.zip`;

const BUILD_OUTPUT_DIRS = ['build', 'dist', 'dist.3p'];
const APP_SERVING_DIRS = [
  ...BUILD_OUTPUT_DIRS,
  'dist.tools',
  'examples',
  'test/manual',
  'test/fixtures/e2e',
];

// TODO(rsimha, ampproject/amp-github-apps#1110): Update storage details.
const GCLOUD_STORAGE_BUCKET = 'gs://amp-travis-builds';

const GIT_BRANCH_URL =
  'https://github.com/ampproject/amphtml/blob/main/contributing/getting-started-e2e.md#create-a-git-branch';

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
 * Upload output helper
 * @param {string} containerDirectory
 * @param {string} gcloudOutputFileName
 * @param {!Array<string>} outputDirs
 * @private
 */
function uploadOutput_(containerDirectory, gcloudOutputFileName, outputDirs) {
  const loggingPrefix = getLoggingPrefix();

  // TODO(danielrozenberg): remove this once deploy-bot uses CircleCI artifacts.
  logWithoutTimestamp(
    `\n${loggingPrefix} Compressing ` +
      cyan(outputDirs.join(', ')) +
      ' into ' +
      cyan(gcloudOutputFileName) +
      '...'
  );
  execOrDie(`zip -r -q ${gcloudOutputFileName} ${outputDirs.join('/ ')}/`);
  execOrDie(`du -sh ${gcloudOutputFileName}`);

  logWithoutTimestamp(
    `${loggingPrefix} Uploading ` +
      cyan(gcloudOutputFileName) +
      ' to ' +
      cyan(GCLOUD_STORAGE_BUCKET) +
      '...'
  );
  execOrDie(
    `gsutil -q -m cp -r ${gcloudOutputFileName} ${GCLOUD_STORAGE_BUCKET}`
  );
  // TODO(danielrozenberg): ...until here.

  if (isCircleciBuild()) {
    fs.ensureDirSync(`/tmp/workspace/builds/${containerDirectory}`);
    for (const outputDir of outputDirs) {
      fs.moveSync(
        `${outputDir}/`,
        `/tmp/workspace/builds/${containerDirectory}/${outputDir}`
      );
    }
  }
}

/**
 * Zips and uploads the build output to a remote storage location
 */
function uploadUnminifiedOutput() {
  uploadOutput_(
    UNMINIFIED_CONTAINER_DIRECTORY,
    UNMINIFIED_GCLOUD_OUTPUT_FILE,
    BUILD_OUTPUT_DIRS
  );
}

/**
 * Zips and uploads the nomodule output to a remote storage location
 */
function uploadNomoduleOutput() {
  uploadOutput_(
    NOMODULE_CONTAINER_DIRECTORY,
    NOMODULE_GCLOUD_OUTPUT_FILE,
    APP_SERVING_DIRS
  );
}

/**
 * Zips and uploads the module output to a remote storage location
 */
function uploadModuleOutput() {
  uploadOutput_(
    MODULE_CONTAINER_DIRECTORY,
    MODULE_GCLOUD_OUTPUT_FILE,
    APP_SERVING_DIRS
  );
}

/**
 * Zips and uploads the output for the given experiment to a remote storage
 * location
 * @param {string} exp
 */
function uploadExperimentOutput(exp) {
  uploadOutput_(exp, EXPERIMENT_GCLOUD_OUTPUT_FILE(exp), APP_SERVING_DIRS);
}

/**
 * Replaces URLS in HTML files, zips and uploads nomodule output,
 * and signals to the AMP PR Deploy bot that the upload is complete.
 */
async function processAndUploadNomoduleOutput() {
  await replaceUrls('test/manual');
  await replaceUrls('examples');
  uploadNomoduleOutput();
}

module.exports = {
  abortTimedJob,
  printChangeSummary,
  skipDependentJobs,
  processAndUploadNomoduleOutput,
  startTimer,
  stopTimer,
  timedExec,
  timedExecOrDie,
  timedExecWithError,
  timedExecOrThrow,
  uploadExperimentOutput,
  uploadUnminifiedOutput,
  uploadNomoduleOutput,
  uploadModuleOutput,
};
