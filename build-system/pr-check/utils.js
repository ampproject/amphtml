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
  gitTravisMasterBaseline,
  shortSha,
} = require('../common/git');
const {
  isTravisBuild,
  travisBuildNumber,
  travisPullRequestSha,
} = require('../common/travis');
const {execOrDie, execOrThrow, execWithError, exec} = require('../common/exec');
const {replaceUrls, signalDistUpload} = require('../tasks/pr-deploy-bot-utils');

const BUILD_OUTPUT_FILE = isTravisBuild()
  ? `amp_build_${travisBuildNumber()}.zip`
  : '';
const DIST_OUTPUT_FILE = isTravisBuild()
  ? `amp_dist_${travisBuildNumber()}.zip`
  : '';
const ESM_DIST_OUTPUT_FILE = isTravisBuild()
  ? `amp_esm_dist_${travisBuildNumber()}.zip`
  : '';

const BUILD_OUTPUT_DIRS = 'build/ dist/ dist.3p/';
const APP_SERVING_DIRS = 'dist.tools/ examples/ test/manual/';

const OUTPUT_STORAGE_LOCATION = 'gs://amp-travis-builds';
const OUTPUT_STORAGE_KEY_FILE = 'sa-travis-key.json';
const OUTPUT_STORAGE_PROJECT_ID = 'amp-travis-build-storage';
const OUTPUT_STORAGE_SERVICE_ACCOUNT =
  'sa-travis@amp-travis-build-storage.iam.gserviceaccount.com';

const GIT_BRANCH_URL =
  'https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-e2e.md#create-a-git-branch';

/**
 * Prints a summary of files changed by, and commits included in the PR.
 * @param {string} fileName
 */
function printChangeSummary(fileName) {
  const fileLogPrefix = colors.bold(colors.yellow(`${fileName}:`));
  let commitSha;

  if (isTravisBuild()) {
    console.log(
      `${fileLogPrefix} Latest commit from ${colors.cyan('master')} included ` +
        `in this build: ${colors.cyan(shortSha(gitTravisMasterBaseline()))}`
    );
    commitSha = travisPullRequestSha();
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
  return (cmd, fileName = 'utils.js') => {
    const startTime = startTimer(cmd, fileName);
    const p = execFn(cmd);
    stopTimer(cmd, fileName, startTime);
    return p;
  };
}

/**
 * Executes the provided command and times it. Errors, if any, are printed.
 * @param {string} cmd
 * @param {string} fileName
 * @return {!Object} Node process
 */
const timedExec = timedExecFn(exec);

/**
 * Executes the provided command and times it. Errors, if any, are returned.
 * @param {string} cmd
 * @param {string} fileName
 * @return {!Object} Node process
 */
const timedExecWithError = timedExecFn(execWithError);

/**
 * Executes the provided command and times it. The program terminates in case of
 * failure.
 * @param {string} cmd
 * @param {string} fileName
 */
const timedExecOrDie = timedExecFn(execOrDie);

/**
 * Executes the provided command and times it. The program throws on error in
 * case of failure.
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
  exec('echo travis_fold:start:download_results && echo');
  authenticateWithStorageLocation_();
  execOrDie(`gsutil cp ${buildOutputDownloadUrl} ${outputFileName}`);
  exec('echo travis_fold:end:download_results');

  console.log(
    `${fileLogPrefix} Extracting ` + colors.cyan(outputFileName) + '...'
  );
  exec('echo travis_fold:start:unzip_results && echo');
  dirsToUnzip.forEach((dir) => {
    execOrDie(`unzip ${outputFileName} '${dir.replace('/', '/*')}'`);
  });
  exec('echo travis_fold:end:unzip_results');

  console.log(fileLogPrefix, 'Verifying extracted files...');
  exec('echo travis_fold:start:verify_unzip_results && echo');
  execOrDie(`ls -laR ${outputDirs}`);
  exec('echo travis_fold:end:verify_unzip_results');
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
  exec('echo travis_fold:start:zip_results && echo');
  execOrDie(`zip -r ${outputFileName} ${outputDirs}`);
  exec('echo travis_fold:end:zip_results');

  console.log(
    `${fileLogPrefix} Uploading ` +
      colors.cyan(outputFileName) +
      ' to ' +
      colors.cyan(OUTPUT_STORAGE_LOCATION) +
      '...'
  );
  exec('echo travis_fold:start:upload_results && echo');
  authenticateWithStorageLocation_();
  execOrDie(`gsutil -m cp -r ${outputFileName} ${OUTPUT_STORAGE_LOCATION}`);
  exec('echo travis_fold:end:upload_results');
}

function authenticateWithStorageLocation_() {
  decryptTravisKey_();
  execOrDie(
    'gcloud auth activate-service-account ' +
      `--key-file ${OUTPUT_STORAGE_KEY_FILE}`
  );
  execOrDie(`gcloud config set account ${OUTPUT_STORAGE_SERVICE_ACCOUNT}`);
  execOrDie('gcloud config set pass_credentials_to_gsutil true');
  execOrDie(`gcloud config set project ${OUTPUT_STORAGE_PROJECT_ID}`);
  execOrDie('gcloud config list');
}

/**
 * Downloads and unzips build output from storage
 * @param {string} functionName
 */
function downloadBuildOutput(functionName) {
  downloadOutput_(functionName, BUILD_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Downloads and unzips dist output from storage
 * @param {string} functionName
 */
function downloadDistOutput(functionName) {
  downloadOutput_(functionName, DIST_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Downloads and unzips esm dist output from storage
 * @param {string} functionName
 */
function downloadEsmDistOutput(functionName) {
  downloadOutput_(functionName, ESM_DIST_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Zips and uploads the build output to a remote storage location
 * @param {string} functionName
 */
function uploadBuildOutput(functionName) {
  uploadOutput_(functionName, BUILD_OUTPUT_FILE, BUILD_OUTPUT_DIRS);
}

/**
 * Zips and uploads the dist output to a remote storage location
 * @param {string} functionName
 */
function uploadDistOutput(functionName) {
  const distOutputDirs = `${BUILD_OUTPUT_DIRS} ${APP_SERVING_DIRS}`;
  uploadOutput_(functionName, DIST_OUTPUT_FILE, distOutputDirs);
}

/**
 * Zips and uploads the esm dist output to a remote storage location
 * @param {string} functionName
 */
function uploadEsmDistOutput(functionName) {
  const esmDistOutputDirs = `${BUILD_OUTPUT_DIRS} ${APP_SERVING_DIRS}`;
  uploadOutput_(functionName, ESM_DIST_OUTPUT_FILE, esmDistOutputDirs);
}

/**
 * Replaces URLS in HTML files, zips and uploads dist output,
 * and signals to the AMP PR Deploy bot that the upload is complete.
 * @param {string} functionName
 */
async function processAndUploadDistOutput(functionName) {
  await replaceUrls('test/manual');
  await replaceUrls('examples');
  uploadDistOutput(functionName);
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
  downloadBuildOutput,
  downloadDistOutput,
  downloadEsmDistOutput,
  printChangeSummary,
  processAndUploadDistOutput,
  startTimer,
  stopTimer,
  stopTimedJob,
  timedExec,
  timedExecOrDie,
  timedExecWithError,
  timedExecOrThrow,
  uploadBuildOutput,
  uploadDistOutput,
  uploadEsmDistOutput,
};
