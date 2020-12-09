/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const log = require('fancy-log');
const {red} = require('ansi-colors');

/**
 * @fileoverview Provides functions that extract various kinds of CI state.
 */

const {
  buildType = '',
  isPullRequestBuild = () => false,
  isPushBuild = () => false,
  pullRequestBranch = () => '',
  pullRequestSha = () => '',
} = process.env.TRAVIS
  ? require('travis')()
  : process.env.GITHUB_ACTIONS
  ? require('github_actions')()
  : process.env.CIRCLECI
  ? require('circleci')()
  : {};

/**
 * Returns true if this is a CI build.
 * @return {boolean}
 */
function isCiBuild() {
  // Travis: https://docs.travis-ci.com/user/environment-variables/#default-environment-variables
  // GitHub Actions: https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
  // CircleCI: https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
  return !!process.env.CI;
}

/**
 * Returns a functions that tests if a build type is active.
 * @param {string} desiredBuildType
 * @return {Function}
 */
function testBuildType(desiredBuildType) {
  return () => buildType === desiredBuildType;
}

/**
 * Returns a CI build variable, reporting an error if it's not a PR build.
 * @param {Function} getter
 * @return {string}
 */
function getPrBuildVar(getter) {
  if (isPullRequestBuild()) {
    log(red('ERROR:'), 'Not a PR build, value is undefined.');
    return '';
  }
  return getter();
}

module.exports = {
  isCiBuild,
  isPullRequestBuild,
  isPushBuild,

  isTravisBuild: testBuildType('travis'),
  isGithubActionsBuild: testBuildType('github_actions'),
  isCircleciBuild: testBuildType('circleci'),

  ciPullRequestBranch: getPrBuildVar(pullRequestBranch),
  ciPullRequestSha: getPrBuildVar(pullRequestSha),
};
