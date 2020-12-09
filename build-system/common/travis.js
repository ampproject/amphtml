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
 * @fileoverview Provides various kinds of Travis state. Reference:
 * https://docs.travis-ci.com/user/environment-variables/#default-environment-variables
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
  return process.env.TRAVIS_EVENT_TYPE === 'pull_request';
}

/**
 * Returns true if this is a Travis Push build.
 * @return {boolean}
 */
function isTravisPushBuild() {
  return process.env.TRAVIS_EVENT_TYPE === 'push';
}

/**
 * Returns the build number of the ongoing Travis build.
 * @return {string}
 */
function travisBuildNumber() {
  return process.env['TRAVIS_BUILD_NUMBER'];
}

/**
 * Return the build URL of the ongoing Travis build.
 * @return {string}
 */
function travisBuildUrl() {
  return process.env['TRAVIS_BUILD_WEB_URL'];
}

/**
 * Returns the job number of the ongoing Travis job.
 * @return {string}
 */
function travisJobNumber() {
  return process.env['TRAVIS_JOB_NUMBER'];
}

/**
 * Return the job URL of the ongoing Travis job.
 * @return {string}
 */
function travisJobUrl() {
  return process.env['TRAVIS_JOB_WEB_URL'];
}

/**
 * Returns the repo slug associated with the ongoing Travis build.
 * @return {string}
 */
function travisRepoSlug() {
  return process.env['TRAVIS_REPO_SLUG'];
}

/**
 * Returns the commit SHA being tested by the ongoing Travis PR build.
 * @return {string}
 */
function travisPullRequestSha() {
  return process.env['TRAVIS_PULL_REQUEST_SHA'];
}

/**
 * Returns the name of the branch being tested by the ongoing Travis PR build.
 * @return {string}
 */
function travisPullRequestBranch() {
  return process.env['TRAVIS_PULL_REQUEST_BRANCH'];
}

/**
 * Returns the Travis branch for push builds.
 * @return {string}
 */
function travisPushBranch() {
  return process.env['TRAVIS_BRANCH'];
}

/**
 * Returns the commit SHA being tested by the ongoing Travis build.
 * @return {string}
 */
function travisCommitSha() {
  return process.env['TRAVIS_COMMIT'];
}

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
