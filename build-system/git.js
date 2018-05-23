/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Provides functions for executing various git commands.
 */

const {getStdout} = require('./exec');

/**
 * Returns the branch point of the current branch off of master.
 * @return {string}
 */
function gitBranchPoint() {
  return getStdout('git merge-base master HEAD').trim();
}

/**
 * Returns the list of files changed on the local branch relative to the branch
 * point off of master, one on each line.
 * @return {!Array<string>}
 */
exports.gitDiffNameOnlyMaster = function() {
  const branchPoint = gitBranchPoint();
  return getStdout(`git diff --name-only ${branchPoint}`).trim().split('\n');
};

/**
 * Returns the list of files changed on the local branch relative to the branch
 * point off of master, in diffstat format.
 * @return {string}
 */
exports.gitDiffStatMaster = function() {
  const branchPoint = gitBranchPoint();
  return getStdout(`git -c color.ui=always diff --stat ${branchPoint}`);
};

/**
 * Returns the list of files added by the local branch relative to the branch
 * point off of master, one on each line.
 * @return {!Array<string>}
 */
exports.gitDiffAddedNameOnlyMaster = function() {
  const branchPoint = gitBranchPoint();
  return getStdout(`git diff --name-only --diff-filter=ARC ${branchPoint}`)
      .trim().split('\n');
};

/**
 * Returns the full color diff of the uncommited changes on the local branch.
 * @return {string}
 */
exports.gitDiffColor = function() {
  return getStdout('git -c color.ui=always diff').trim();
};

/**
 * Returns the name of the local branch.
 * @return {string}
 */
exports.gitBranchName = function() {
  return getStdout('git rev-parse --abbrev-ref HEAD').trim();
};

/**
 * Returns the email of the author of the latest commit on the local branch.
 * @return {string}
 */
exports.gitCommitterEmail = function() {
  return getStdout('git log -1 --pretty=format:"%ae"').trim();
};
