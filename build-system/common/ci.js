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

const {
  isCircleciBuild,
  isCircleciPullRequestBuild,
  isCircleciPushBuild,
} = require('./circleci');
const {
  isGithubActionsBuild,
  isGithubActionsPullRequestBuild,
  isGithubActionsPushBuild,
} = require('./github-actions');
const {
  isTravisBuild,
  isTravisPullRequestBuild,
  isTravisPushBuild,
} = require('./travis');

/**
 * @fileoverview Provides functions that extract various kinds of CI state.
 */

/**
 * The full set of available CI services.
 * @enum {string}
 **/
const ciService = {
  TRAVIS: 'travis',
  GITHUB_ACTIONS: 'github_actions',
  CIRCLECI: 'circleci',
  NONE: 'none',
};

/**
 * Determines the service on which CI is being run, if any.
 * @return {string}
 */
function getCiService() {
  return isTravisBuild()
    ? ciService.TRAVIS
    : isGithubActionsBuild()
    ? ciService.GITHUB_ACTIONS
    : isCircleciBuild()
    ? ciService.GITHUB_ACTIONS
    : ciService.NONE;
}

/**
 * Mapping of generic CI functions to service-specific functions.
 */
const serviceFunctionMap = {
  'travis': {
    'isPullRequestBuild': isTravisPullRequestBuild,
    'isPushBuild': isTravisPushBuild,
  },
  'github_actions': {
    'isPullRequestBuild': isGithubActionsPullRequestBuild,
    'isPushBuild': isGithubActionsPushBuild,
  },
  'circleci': {
    'isPullRequestBuild': isCircleciPullRequestBuild,
    'isPushBuild': isCircleciPushBuild,
  },
  'none': {
    'isPullRequestBuild': () => false,
    'isPushBuild': () => false,
  },
};

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
 * Returns true if this is a PR build.
 * @return {boolean}
 */
function isPullRequestBuild() {
  return serviceFunctionMap[getCiService()]['isPullRequestBuild']();
}

/**
 * Returns true if this is a push build.
 * @return {boolean}
 */
function isPushBuild() {
  return serviceFunctionMap[getCiService()]['isPushBuild']();
}

module.exports = {
  isCiBuild,
  isPullRequestBuild,
  isPushBuild,
};
