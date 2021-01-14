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

const colors = require('ansi-colors');
const {
  gitBranchCreationPoint,
  gitBranchName,
  gitCommitHash,
  gitDiffCommitLog,
  gitDiffStatMaster,
  gitCiMasterBaseline,
  shortSha,
} = require('../common/git');
const {execOrDie, execOrThrow, execWithError, exec} = require('../common/exec');
const {isCiBuild, ciBuildNumber, ciPullRequestSha} = require('../common/ci');
const {replaceUrls, signalDistUpload} = require('../tasks/pr-deploy-bot-utils');

const UNMINIFIED_OUTPUT_FILE = isCiBuild()
  ? `amp_unminified_${ciBuildNumber()}.zip`
  : '';
const NOMODULE_OUTPUT_FILE = isCiBuild()
  ? `amp_nomodule_${ciBuildNumber()}.zip`
  : '';
const MODULE_OUTPUT_FILE = isCiBuild()
  ? `amp_module_${ciBuildNumber()}.zip`
  : '';

const BUILD_OUTPUT_DIRS = 'build/ dist/ dist.3p/';
const APP_SERVING_DIRS = 'dist.tools/ examples/ test/manual/';

// TODO(rsimha, ampproject/amp-github-apps#1110): Update storage details.
const OUTPUT_STORAGE_LOCATION = 'gs://amp-travis-builds';
const OUTPUT_STORAGE_KEY_FILE = 'sa-travis-key.json';
const OUTPUT_STORAGE_PROJECT_ID = 'amp-travis-build-storage';
const OUTPUT_STORAGE_SERVICE_ACCOUNT =
  'sa-travis@amp-travis-build-storage.iam.gserviceaccount.com';

const GCLOUD_LOGGING_FLAGS = '--quiet --verbosity error';

const GIT_BRANCH_URL =
  'https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-e2e.md#create-a-git-branch';

/**
 * Prints a summary of files changed by, and commits included in the PR.
 * @param {string} fileName
 */
function printChangeSummary(fileName) {
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));
  let commitSha;

  if (isCiBuild()) {
    console.log(
      `${fileLogPrefix} Latest commit from ${colors.cyan('master')} included ` +
        `in this build: ${colors.cyan(shortSha(gitCiMasterBaseline()))}`
    );
    commitSha = ciPullRequestSha();
  } else {
    commitSha = gitCommitHash();
  }
  console.log(
    `${fileLogPrefix} Testing the following changes at commit ` +
      `${colors.cyan(shortSha(commitSha))}`
  );

  const filesChanged = gitDiffStatMaster();
  console.log(filesChanged);

  const branchCreationPoint = gitBranchCreationPoint();
  if (branchCreationPoint) {
    console.log(
      `${fileLogPrefix} Commit log since branch`,
      `${colors.cyan(gitBranchName())} was forked from`,
      `${colors.cyan('master')} at`,
      `${colors.cyan(shortSha(branchCreationPoint))}:`
    );
    console.log(gitDiffCommitLog() + '\n');
  } else {
    console.error(
      fileLogPrefix,
      colors.yellow('WARNING:'),
      'Could not find a common ancestor for',
      colors.cyan(gitBranchName()),
      'and',
      colors.cyan('master') + '. (This can happen with older PR branches.)'
    );
    console.error(
      fileLogPrefix,
      colors.yellow('NOTE 1:'),
      'If this causes unexpected test failures, try rebasing the PR branch on',
      colors.cyan('master') + '.'
    );
    console.error(
      fileLogPrefix,
      colors.yellow('NOTE 2:'),
      "If rebasing doesn't work, you may have to recreate the branch. See",
      colors.cyan(GIT_BRANCH_URL) + '.\n'
    );
  }
}

/**
 * Starts a timer to measure the execution time of the given function.
 * @param {string} functionName
 * @param {string} fileName
 * @return {DOMHighResTimeStamp}
 */
function startTimer(functionName, fileName) {
  const startTime = Date.now();
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));
  console.log(
    '\n' + fileLogPrefix,
    'Running',
    colors.cyan(functionName) + '...'
  );
  return startTime;
}

/**
 * Stops the timer for the given function and prints the execution time.
 * @param {string} functionName
 * @param {string} fileName
 * @param {DOMHighResTimeStamp} startTime
 * @return {number}
 */
function stopTimer(functionName, fileName, startTime) {
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  const mins = Math.floor(executionTime / 60000);
  const secs = Math.floor((executionTime % 60000) / 1000);
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));
  console.log(
    fileLogPrefix,
    'Done running',
    colors.cyan(functionName),
    'Total time:',
    colors.green(mins + 'm ' + secs + 's')
  );
}

/**
 * Stops the Node process and timer
 * @param {string} fileName
 * @param {startTime} startTime
 */
function stopTimedJob(fileName, startTime) {
  stopTimer(fileName, fileName, startTime);
  process.exitCode = 1;
}

/**
 * Wraps an exec helper in a timer. Returns the result of the helper.
 * @param {!Function(string, string=): ?} execFn
 * @return {!Function(string, string=): ?}
 */
function timedExecFn(execFn) {
  return (cmd, fileName, ...rest) => {
    const startTime = startTimer(cmd, fileName);
    const p = execFn(cmd, ...rest);
    stopTimer(cmd, fileName, startTime);
    return p;
  };
}

/**
 * Executes the provided command and times it. Errors, if any, are printed.
 * @function
 * @param {string} cmd
 * @param {string} fileName
 * @return {!Object} Node process
 */
const timedExec = timedExecFn(exec);

/**
 * Executes the provided command and times it. Errors, if any, are returned.
 * @function
 * @param {string} cmd
 * @param {string} fileName
 * @return {!Object} Node process
 */
const timedExecWithError = timedExecFn(execWithError);

/**
 * Executes the provided command and times it. The program terminates in case of
 * failure.
 * @function
 * @param {string} cmd
 * @param {string} fileName
 */
const timedExecOrDie = timedExecFn(execOrDie);

/**
 * Executes the provided command and times it. The program throws on error in
 * case of failure.
 * @function
 * @param {string} cmd
 * @param {string} fileName
 */
const timedExecOrThrow = timedExecFn(execOrThrow);

/**
 * Download output helper
 * @param {string} functionName
 * @param {string} outputFileName
 * @param {string} outputDirs
 * @private
 */
function downloadOutput_(functionName, outputFileName, outputDirs) {
  const fileLogPrefix = colors.bold(colors.yellow(`${functionName}:`));
  const buildOutputDownloadUrl = `${OUTPUT_STORAGE_LOCATION}/${outputFileName}`;
  const dirsToUnzip = outputDirs.split(' ');

  console.log(
    `${fileLogPrefix} Downloading build output from ` +
      colors.cyan(buildOutputDownloadUrl) +
      '...'
  );
  authenticateWithStorageLocation_();
  execOrDie(`gsutil cp ${buildOutputDownloadUrl} ${outputFileName}`);

  console.log(
    `${fileLogPrefix} Extracting ` + colors.cyan(outputFileName) + '...'
  );
  dirsToUnzip.forEach((dir) => {
    execOrDie(`unzip -q -o ${outputFileName} '${dir.replace('/', '/*')}'`);
  });
  execOrDie(`du -sh ${outputDirs}`);
}

/**
 * Upload output helper
 * @param {string} functionName
 * @param {string} outputFileName
 * @param {string} outputDirs
 * @private
 */
function uploadOutput_(functionName, outputFileName, outputDirs) {
  const fileLogPrefix = colors.bold(colors.yellow(`${functionName}:`));

  console.log(
    `\n${fileLogPrefix} Compressing ` +
      colors.cyan(outputDirs.split(' ').join(', ')) +
      ' into ' +
      colors.cyan(outputFileName) +
      '...'
  );
  execOrDie(`zip -r -q ${outputFileName} ${outputDirs}`);
  execOrDie(`du -sh ${outputFileName}`);

  console.log(
    `${fileLogPrefix} Uploading ` +
      colors.cyan(outputFileName) +
      ' to ' +
      colors.cyan(OUTPUT_STORAGE_LOCATION) +
      '...'
  );
  authenticateWithStorageLocation_();
  execOrDie(`gsutil -m cp -r ${outputFileName} ${OUTPUT_STORAGE_LOCATION}`);
}

function authenticateWithStorageLocation_() {
  decryptTravisKey_();
  execOrDie(
    `gcloud auth activate-service-account --key-file ${OUTPUT_STORAGE_KEY_FILE} ${GCLOUD_LOGGING_FLAGS}`
  );
  execOrDie(
    `gcloud config set account ${OUTPUT_STORAGE_SERVICE_ACCOUNT} ${GCLOUD_LOGGING_FLAGS}`
  );
  execOrDie(
    `gcloud config set pass_credentials_to_gsutil true ${GCLOUD_LOGGING_FLAGS}`
  );
  execOrDie(
    `gcloud config set project ${OUTPUT_STORAGE_PROJECT_ID} ${GCLOUD_LOGGING_FLAGS}`
  );
}

/**
 * Downloads and unzips build output from storage
 * @param {string} functionName
 */
function downloadUnminifiedOutput(functionName) {
  downloadOutput_(functionName, UNMINIFIED_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Downloads and unzips nomodule output from storage
 * @param {string} functionName
 */
function downloadNomoduleOutput(functionName) {
  downloadOutput_(functionName, NOMODULE_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Downloads and unzips module output from storage
 * @param {string} functionName
 */
function downloadModuleOutput(functionName) {
  downloadOutput_(functionName, MODULE_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Zips and uploads the build output to a remote storage location
 * @param {string} functionName
 */
function uploadUnminifiedOutput(functionName) {
  uploadOutput_(functionName, UNMINIFIED_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Zips and uploads the nomodule output to a remote storage location
 * @param {string} functionName
 */
function uploadNomoduleOutput(functionName) {
  const nomoduleOutputDirs = `${BUILD_OUTPUT_DIRS} ${APP_SERVING_DIRS}`;
  uploadOutput_(functionName, NOMODULE_OUTPUT_FILE, nomoduleOutputDirs);
}

/**
 * Zips and uploads the module output to a remote storage location
 * @param {string} functionName
 */
function uploadModuleOutput(functionName) {
  const moduleOutputDirs = `${BUILD_OUTPUT_DIRS} ${APP_SERVING_DIRS}`;
  uploadOutput_(functionName, MODULE_OUTPUT_FILE, moduleOutputDirs);
}

/**
 * Replaces URLS in HTML files, zips and uploads nomodule output,
 * and signals to the AMP PR Deploy bot that the upload is complete.
 * @param {string} functionName
 */
async function processAndUploadNomoduleOutput(functionName) {
  await replaceUrls('test/manual');
  await replaceUrls('examples');
  uploadNomoduleOutput(functionName);
  await signalDistUpload('success');
}

/**
 * Decrypts key used by storage service account
 */
function decryptTravisKey_() {
  // -md sha256 is required due to encryption differences between
  // openssl 1.1.1a, which was used to encrypt the key, and
  // openssl 1.0.2g, which is used by Travis to decrypt.
  execOrDie(
    `openssl aes-256-cbc -md sha256 -k ${process.env.GCP_TOKEN} -in ` +
      `build-system/common/sa-travis-key.json.enc -out ` +
      `${OUTPUT_STORAGE_KEY_FILE} -d`
  );
}

module.exports = {
  downloadUnminifiedOutput,
  downloadNomoduleOutput,
  downloadModuleOutput,
  printChangeSummary,
  processAndUploadNomoduleOutput,
  startTimer,
  stopTimer,
  stopTimedJob,
  timedExec,
  timedExecOrDie,
  timedExecWithError,
  timedExecOrThrow,
  uploadUnminifiedOutput,
  uploadNomoduleOutput,
  uploadModuleOutput,
};
