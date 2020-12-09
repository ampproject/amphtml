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
 * @fileoverview Provides various kinds of GitHub Actions state. Reference:
 * https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
 */

/**
 * Returns true if this is a GitHub Actions build.
 * @return {boolean}
 */
function isGithubActionsBuild() {
  return !!process.env.GITHUB_ACTIONS;
}

/**
 * Returns true if this is a PR build.
 * @return {boolean}
 */
function isGithubActionsPullRequestBuild() {
  return process.env.GITHUB_EVENT_NAME === 'pull_request';
}

/**
 * Returns true if this is a Push build.
 * @return {boolean}
 */
function isGithubActionsPushBuild() {
  return process.env.GITHUB_EVENT_NAME === 'push';
}

/**
 * Returns the name of the branch being tested by the ongoing Github Actions PR build.
 * @return {string}
 */
function githubActionsPullRequestBranch() {
  return process.env['GITHUB_REF'];
}

/**
 * Returns the commit SHA being tested by the ongoing Github Actions PR build.
 * @return {string}
 */
function githubActionsPullRequestSha() {
  return process.env['GITHUB_SHA'];
}

module.exports = {
  githubActionsPullRequestBranch,
  githubActionsPullRequestSha,
  isGithubActionsBuild,
  isGithubActionsPullRequestBuild,
  isGithubActionsPushBuild,
};
