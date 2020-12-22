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

/**
 * @fileoverview Provides various kinds of CI state.
 *
 * References:
 * Travis: https://docs.travis-ci.com/user/environment-variables/#default-environment-variables
 * GitHub Actions: https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
 * CircleCI: https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
 */

/**
 * Shorthand to extract an environment variable.
 * @param {string} key
 * @return {string|undefined}
 */
function env(key) {
  return process.env[key];
}

/**
 * Returns true if this is a CI build.
 * @return {boolean}
 */
function isCiBuild() {
  return !!env('CI');
}

/**
 * Returns true if this is a Travis build.
 * @return {boolean}
 */
function isTravisBuild() {
  return !!env('TRAVIS');
}

/**
 * Returns true if this is a GitHub Actions build.
 * @return {boolean}
 */
function isGithubActionsBuild() {
  return !!env('GITHUB_ACTIONS');
}

/**
 * Returns true if this is a CircleCI build.
 * @return {boolean}
 */
function isCircleciBuild() {
  return !!env('CIRCLECI');
}

/**
 * Constants for reduced code size.
 */
const isTravis = isTravisBuild();
const isGithubActions = isGithubActionsBuild();
const isCircleci = isCircleciBuild();

/**
 * Returns true if this is a PR build.
 * @return {boolean}
 */
function isPullRequestBuild() {
  return isTravis
    ? env('TRAVIS_EVENT_TYPE') === 'pull_request'
    : isGithubActions
    ? env('GITHUB_EVENT_NAME') === 'pull_request'
    : isCircleci
    ? !!env('CIRCLE_PULL_REQUEST')
    : false;
}

/**
 * Returns true if this is a push build.
 * @return {boolean}
 */
function isPushBuild() {
  return isTravis
    ? env('TRAVIS_EVENT_TYPE') === 'push'
    : isGithubActions
    ? env('GITHUB_EVENT_NAME') === 'push'
    : isCircleci
    ? !env('CIRCLE_PULL_REQUEST')
    : false;
}

/**
 * Returns the name of the PR branch.
 * @return {string}
 */
function ciPullRequestBranch() {
  return isTravis
    ? env('TRAVIS_PULL_REQUEST_BRANCH')
    : isGithubActions
    ? env('GITHUB_HEAD_REF')
    : isCircleci
    ? env('CIRCLE_BRANCH')
    : '';
}

/**
 * Returns the commit SHA being tested by a PR build.
 * @return {string}
 */
function ciPullRequestSha() {
  return isTravis
    ? env('TRAVIS_PULL_REQUEST_SHA')
    : isGithubActions
    ? require(env('GITHUB_EVENT_PATH')).pull_request.head.sha
    : isCircleci
    ? env('CIRCLE_SHA1')
    : '';
}

/**
 * Returns the branch for push builds.
 * @return {string}
 */
function ciPushBranch() {
  return isTravis
    ? env('TRAVIS_BRANCH')
    : isGithubActions
    ? env('GITHUB_REF')
    : isCircleci
    ? env('CIRCLE_BRANCH')
    : '';
}

/**
 * Returns the commit SHA being tested by a push build.
 * @return {string}
 */
function ciCommitSha() {
  return isTravis
    ? env('TRAVIS_COMMIT')
    : isGithubActions
    ? env('GITHUB_SHA')
    : isCircleci
    ? env('CIRCLE_SHA1')
    : '';
}

/**
 * Returns the number of the current build.
 * @return {string}
 */
function ciBuildNumber() {
  return isTravis
    ? env('TRAVIS_BUILD_NUMBER')
    : isGithubActions
    ? env('GITHUB_RUN_ID')
    : isCircleci
    ? env('CIRCLE_BUILD_NUM')
    : '';
}

/**
 * Returns the URL of the current build.
 * @return {string}
 */
function ciBuildUrl() {
  return isTravis
    ? env('TRAVIS_BUILD_WEB_URL')
    : isGithubActions
    ? `${env('GITHUB_SERVER_URL')}/${env('GITHUB_REPOSITORY')}/actions/runs/${env('GITHUB_RUN_ID')}` // prettier-ignore
    : isCircleci
    ? env('CIRCLE_BUILD_URL')
    : '';
}

/**
 * Returns the number of the current job.
 * @return {string}
 */
function ciJobNumber() {
  return isTravis
    ? env('TRAVIS_JOB_NUMBER')
    : isGithubActions
    ? env('GITHUB_RUN_NUMBER')
    : isCircleci
    ? env('CIRCLE_NODE_INDEX')
    : '';
}

/**
 * Returns the URL of the current job.
 * @return {string}
 */
function ciJobUrl() {
  return isTravis
    ? env('TRAVIS_JOB_WEB_URL')
    : isGithubActions
    ? // TODO(rsimha): Try to reverse engineer the GH Actions job URL from the build URL.
      `${env('GITHUB_SERVER_URL')}/${env('GITHUB_REPOSITORY')}/actions/runs/${env('GITHUB_RUN_ID')}` // prettier-ignore
    : isCircleci
    ? env('CIRCLE_BUILD_URL') // TODO(rsimha): Test and modify if necessary.
    : '';
}

/**
 * Returns the repo slug for the ongoing build.
 * @return {string}
 */
function ciRepoSlug() {
  return isTravis
    ? env('TRAVIS_REPO_SLUG')
    : isGithubActions
    ? env('GITHUB_REPOSITORY')
    : isCircleci
    ? `${env('CIRCLE_PROJECT_USERNAME')}/${env('CIRCLE_PROJECT_REPONAME')}`
    : '';
}

module.exports = {
  ciBuildNumber,
  ciBuildUrl,
  ciCommitSha,
  ciJobNumber,
  ciJobUrl,
  ciPullRequestBranch,
  ciPullRequestSha,
  ciPushBranch,
  ciRepoSlug,
  isCiBuild,
  isCircleciBuild,
  isGithubActionsBuild,
  isPullRequestBuild,
  isPushBuild,
  isTravisBuild,
};
