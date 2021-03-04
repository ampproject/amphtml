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
 * @fileoverview Script that runs various checks during CI.
 */

const {buildTargetsInclude, Targets} = require('./build-targets');
const {reportAllExpectedTests} = require('../tasks/report-test-status');
const {runCiJob} = require('./ci-job');
const {timedExecOrDie} = require('./utils');

const jobName = 'checks.js';

/**
 * @return {void}
 */
function pushBuildWorkflow() {
  timedExecOrDie('gulp update-packages');
  timedExecOrDie('gulp presubmit');
  timedExecOrDie('gulp lint');
  timedExecOrDie('gulp prettify');
  timedExecOrDie('gulp ava');
  timedExecOrDie('gulp babel-plugin-tests');
  timedExecOrDie('gulp caches-json');
  timedExecOrDie('gulp dev-dashboard-tests');
  timedExecOrDie('gulp check-exact-versions');
  timedExecOrDie('gulp check-renovate-config');
  timedExecOrDie('gulp server-tests');
  timedExecOrDie('gulp dep-check');
  timedExecOrDie('gulp check-types');
  timedExecOrDie('gulp check-sourcemaps');
  timedExecOrDie('gulp performance-urls');
  timedExecOrDie('gulp check-analytics-vendors-list');
  timedExecOrDie('gulp check-video-interface-list');
  timedExecOrDie('gulp get-zindex');
  timedExecOrDie('gulp markdown-toc');
}

/**
 * @return {Promise<void>}
 */
async function prBuildWorkflow() {
  await reportAllExpectedTests();
  timedExecOrDie('gulp update-packages');

  if (buildTargetsInclude(Targets.PRESUBMIT)) {
    timedExecOrDie('gulp presubmit');
  }

  if (buildTargetsInclude(Targets.LINT)) {
    timedExecOrDie('gulp lint');
  }

  if (buildTargetsInclude(Targets.PRETTIFY)) {
    timedExecOrDie('gulp prettify');
  }

  if (buildTargetsInclude(Targets.AVA)) {
    timedExecOrDie('gulp ava');
  }

  if (buildTargetsInclude(Targets.BABEL_PLUGIN)) {
    timedExecOrDie('gulp babel-plugin-tests');
  }

  if (buildTargetsInclude(Targets.CACHES_JSON)) {
    timedExecOrDie('gulp caches-json');
  }

  if (buildTargetsInclude(Targets.DOCS)) {
    timedExecOrDie('gulp check-links --local_changes'); // only for PR builds
    timedExecOrDie('gulp markdown-toc');
  }

  if (buildTargetsInclude(Targets.DEV_DASHBOARD)) {
    timedExecOrDie('gulp dev-dashboard-tests');
  }

  // Validate owners syntax only for PR builds.
  if (buildTargetsInclude(Targets.OWNERS)) {
    timedExecOrDie('gulp check-owners --local_changes');
  }

  if (buildTargetsInclude(Targets.PACKAGE_UPGRADE)) {
    timedExecOrDie('gulp check-exact-versions');
  }

  if (buildTargetsInclude(Targets.RENOVATE_CONFIG)) {
    timedExecOrDie('gulp check-renovate-config');
  }

  if (buildTargetsInclude(Targets.SERVER)) {
    timedExecOrDie('gulp server-tests');
  }

  if (buildTargetsInclude(Targets.RUNTIME)) {
    timedExecOrDie('gulp dep-check');
    timedExecOrDie('gulp check-types');
    timedExecOrDie('gulp check-sourcemaps');
    timedExecOrDie('gulp performance-urls');
    timedExecOrDie('gulp check-analytics-vendors-list');
    timedExecOrDie('gulp check-video-interface-list');
    timedExecOrDie('gulp get-zindex');
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
