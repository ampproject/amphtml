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
const log = require('fancy-log');

const {red, cyan} = colors;

/**
 * @fileoverview Provides functions that extract various kinds of Travis state.
 */

/**
 * Returns true if this is a Travis build.
 * @return {boolean}
 */
function isTravisBuild() {
  return !!process.env.TRAVIS;
}

/**
 * Returns true if this is a Travis PR build.
 * @return {boolean}
 */
function isTravisPullRequestBuild() {
  return isTravisBuild() && process.env.TRAVIS_EVENT_TYPE === 'pull_request';
}

/**
 * Returns true if this is a Travis Push build.
 * @return {boolean}
 */
function isTravisPushBuild() {
  return isTravisBuild() && process.env.TRAVIS_EVENT_TYPE === 'push';
}

/**
 * Returns a function to test the environment and look up a Travis environment
 * variable
 * @param {function():boolean} testFn
 * @param {string} errorMsg
 * @param {string} envKey
 * @return {function()}
 */
function travisEnv(testFn, errorMsg, envKey) {
  return function () {
    if (!testFn()) {
      log(red('ERROR:'), errorMsg, 'Cannot get', cyan(`process.env.${envKey}`));
    }
    return process.env[envKey];
  };
}

const travisBuildEnv = (envKey) =>
  travisEnv(isTravisBuild, 'This is not a Travis build.', envKey);

/**
 * Returns the build number of the ongoing Travis build.
 * @return {string}
 */
const travisBuildNumber = travisBuildEnv('TRAVIS_BUILD_NUMBER');

/**
 * Return the build URL of the ongoing Travis build.
 * @return {string}
 */
const travisBuildUrl = travisBuildEnv('TRAVIS_BUILD_WEB_URL');

/**
 * Returns the job number of the ongoing Travis job.
 * @return {string}
 */
const travisJobNumber = travisBuildEnv('TRAVIS_JOB_NUMBER');

/**
 * Return the job URL of the ongoing Travis job.
 * @return {string}
 */
const travisJobUrl = travisBuildEnv('TRAVIS_JOB_WEB_URL');

/**
 * Returns the repo slug associated with the ongoing Travis build.
 * @return {string}
 */
const travisRepoSlug = travisBuildEnv('TRAVIS_REPO_SLUG');

/**
 * Returns the commit SHA being tested by the ongoing Travis PR build.
 * @return {string}
 */
const travisPullRequestSha = travisEnv(
  isTravisPullRequestBuild,
  'This is not a Travis PR build.',
  'TRAVIS_PULL_REQUEST_SHA'
);

/**
 * Returns the name of the branch being tested by the ongoing Travis PR build.
 * @return {string}
 */
const travisPullRequestBranch = travisEnv(
  isTravisPullRequestBuild,
  'This is not a Travis PR build.',
  'TRAVIS_PULL_REQUEST_BRANCH'
);

/**
 * Returns the Travis branch for push builds.
 * @return {string}
 */
const travisPushBranch = travisEnv(
  isTravisPushBuild,
  'This is not a Travis push build.',
  'TRAVIS_BRANCH'
);

/**
 * Returns the commit SHA being tested by the ongoing Travis build.
 * @return {string}
 */
const travisCommitSha = travisBuildEnv('TRAVIS_COMMIT');

module.exports = {
  isTravisBuild,
  isTravisPullRequestBuild,
  isTravisPushBuild,
  travisBuildNumber,
  travisBuildUrl,
  travisCommitSha,
  travisJobNumber,
  travisJobUrl,
  travisPullRequestBranch,
  travisPullRequestSha,
  travisPushBranch,
  travisRepoSlug,
};
