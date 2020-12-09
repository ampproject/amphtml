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
 * @fileoverview Provides various kinds of CircleCI state. Reference:
 * Reference: https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
 */

/**
 * Returns true if this is a CircleCI build.
 * @return {boolean}
 */
function isCircleciBuild() {
  return !!process.env.CIRCLECI;
}

/**
 * Returns true if this is a PR build.
 * @return {boolean}
 */
function isCircleciPullRequestBuild() {
  return !!process.env.CIRCLE_PULL_REQUEST;
}

/**
 * Returns true if this is a Push build.
 * @return {boolean}
 */
function isCircleciPushBuild() {
  return !process.env.CIRCLE_PULL_REQUEST;
}

/**
 * Returns the name of the branch being tested by the ongoing CircleCI PR build.
 * @return {string}
 */
function circleciPullRequestBranch() {
  return process.env['CIRCLE_BRANCH'];
}

/**
 * Returns the commit SHA being tested by the ongoing CircleCI PR build.
 * @return {string}
 */
function circleciPullRequestSha() {
  return process.env['CIRCLE_SHA1'];
}

module.exports = {
  circleciPullRequestBranch,
  circleciPullRequestSha,
  isCircleciBuild,
  isCircleciPullRequestBuild,
  isCircleciPushBuild,
};
