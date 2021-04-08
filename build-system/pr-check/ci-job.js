/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
  abortTimedJob,
  printChangeSummary,
  startTimer,
  stopTimer,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');
const {runNpmChecks} = require('./npm-checks');
const {setLoggingPrefix} = require('../common/logging');
const {updatePackages} = require('../common/update-packages');

/**
 * Helper used by all CI job scripts. Runs the PR / push build workflow.
 * @param {string} jobName
 * @param {function} pushBuildWorkflow
 * @param {function} prBuildWorkflow
 */
async function runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow) {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);
  updatePackages();
  if (!runNpmChecks()) {
    abortTimedJob(jobName, startTime);
    return;
  }
  if (isPullRequestBuild()) {
    printChangeSummary();
    determineBuildTargets();
    await prBuildWorkflow();
  } else {
    await pushBuildWorkflow();
  }
  stopTimer(jobName, startTime);
}

module.exports = {
  runCiJob,
};
