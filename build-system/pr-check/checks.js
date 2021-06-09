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

const {reportAllExpectedTests} = require('../tasks/report-test-status');
const {runCiJob} = require('./ci-job');
const {Targets, buildTargetsInclude} = require('./build-targets');
const {timedExecOrDie} = require('./utils');

const jobName = 'checks.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp presubmit');
  timedExecOrDie('amp check-invalid-whitespaces');
  timedExecOrDie('amp validate-html-fixtures');
  timedExecOrDie('amp lint');
  timedExecOrDie('amp prettify');
  timedExecOrDie('amp ava');
  timedExecOrDie('amp check-build-system');
  timedExecOrDie('amp babel-plugin-tests');
  timedExecOrDie('amp caches-json');
  timedExecOrDie('amp dev-dashboard-tests');
  timedExecOrDie('amp check-exact-versions');
  timedExecOrDie('amp check-renovate-config');
  timedExecOrDie('amp server-tests');
  timedExecOrDie('amp make-extension --name=t --test --cleanup');
  timedExecOrDie('amp make-extension --name=t --test --cleanup --bento');
  timedExecOrDie('amp dep-check');
  timedExecOrDie('amp check-types');
  timedExecOrDie('amp check-sourcemaps');
  timedExecOrDie('amp performance-urls');
  timedExecOrDie('amp check-analytics-vendors-list');
  timedExecOrDie('amp check-update-design-review-issues');
  timedExecOrDie('amp check-video-interface-list');
  timedExecOrDie('amp get-zindex');
  timedExecOrDie('amp markdown-toc');
}

/**
 * Steps to run during PR builds.
 * @return {Promise<void>}
 */
async function prBuildWorkflow() {
  await reportAllExpectedTests();

  if (buildTargetsInclude(Targets.PRESUBMIT)) {
    timedExecOrDie('amp presubmit');
  }

  if (buildTargetsInclude(Targets.INVALID_WHITESPACES)) {
    timedExecOrDie('amp check-invalid-whitespaces');
  }

  if (buildTargetsInclude(Targets.HTML_FIXTURES)) {
    timedExecOrDie('amp validate-html-fixtures');
  }

  if (buildTargetsInclude(Targets.LINT_RULES)) {
    timedExecOrDie('amp lint');
  } else if (buildTargetsInclude(Targets.LINT)) {
    timedExecOrDie('amp lint --local_changes');
  }

  if (buildTargetsInclude(Targets.PRETTIFY)) {
    timedExecOrDie('amp prettify');
  }

  if (buildTargetsInclude(Targets.AVA)) {
    timedExecOrDie('amp ava');
  }

  if (buildTargetsInclude(Targets.BUILD_SYSTEM)) {
    timedExecOrDie('amp check-build-system');
    timedExecOrDie('amp check-update-design-review-issues');
  }

  if (buildTargetsInclude(Targets.BABEL_PLUGIN)) {
    timedExecOrDie('amp babel-plugin-tests');
  }

  if (buildTargetsInclude(Targets.CACHES_JSON)) {
    timedExecOrDie('amp caches-json');
  }

  if (buildTargetsInclude(Targets.DOCS)) {
    timedExecOrDie('amp check-links --local_changes'); // only for PR builds
    timedExecOrDie('amp markdown-toc');
  }

  if (buildTargetsInclude(Targets.DEV_DASHBOARD)) {
    timedExecOrDie('amp dev-dashboard-tests');
  }

  if (buildTargetsInclude(Targets.OWNERS)) {
    timedExecOrDie('amp check-owners --local_changes'); // only for PR builds
  }

  if (buildTargetsInclude(Targets.PACKAGE_UPGRADE)) {
    timedExecOrDie('amp check-exact-versions');
  }

  if (buildTargetsInclude(Targets.RENOVATE_CONFIG)) {
    timedExecOrDie('amp check-renovate-config');
  }

  if (buildTargetsInclude(Targets.SERVER)) {
    timedExecOrDie('amp server-tests');
  }

  if (buildTargetsInclude(Targets.AVA, Targets.RUNTIME)) {
    timedExecOrDie('amp make-extension --name=t --test --cleanup');
    timedExecOrDie('amp make-extension --name=t --test --cleanup --bento');
  }

  if (buildTargetsInclude(Targets.RUNTIME)) {
    timedExecOrDie('amp dep-check');
    timedExecOrDie('amp check-types');
    timedExecOrDie('amp check-sourcemaps');
    timedExecOrDie('amp performance-urls');
    timedExecOrDie('amp check-analytics-vendors-list');
    timedExecOrDie('amp check-video-interface-list');
    timedExecOrDie('amp get-zindex');
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
