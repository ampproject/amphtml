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

const argv = require('minimist')(process.argv.slice(2));
const {
  abortTimedJob,
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExec,
} = require('../pr-check/utils');
const {
  buildTargetsInclude,
  determineBuildTargets,
  Targets,
} = require('../pr-check/build-targets');
const {runNpmChecks} = require('../pr-check/npm-checks');
const {setLoggingPrefix} = require('../common/logging');

const jobName = 'pr-check.js';

/**
 * This file runs tests against the local workspace to mimic the CI build as
 * closely as possible.
 * @param {Function} cb
 */
async function prCheck(cb) {
  setLoggingPrefix(jobName);

  const failTask = () => {
    stopTimer(jobName, startTime);
    const err = new Error('Local PR check failed. See logs above.');
    err.showStack = false;
    cb(err);
  };

  const runCheck = (cmd) => {
    const {status} = timedExec(cmd);
    if (status != 0) {
      failTask();
    }
  };

  const startTime = startTimer(jobName);
  if (!runNpmChecks()) {
    abortTimedJob(jobName, startTime);
    failTask();
  }

  printChangeSummary();
  determineBuildTargets();

  if (buildTargetsInclude(Targets.PRESUBMIT)) {
    runCheck('gulp presubmit');
  }

  if (buildTargetsInclude(Targets.LINT)) {
    runCheck('gulp lint --local_changes');
  }

  if (buildTargetsInclude(Targets.PRETTIFY)) {
    runCheck('gulp prettify --local_changes');
  }

  if (buildTargetsInclude(Targets.AVA)) {
    runCheck('gulp ava');
  }

  if (buildTargetsInclude(Targets.BABEL_PLUGIN)) {
    runCheck('gulp babel-plugin-tests');
  }

  if (buildTargetsInclude(Targets.CACHES_JSON)) {
    runCheck('gulp caches-json');
  }

  if (buildTargetsInclude(Targets.DOCS)) {
    runCheck('gulp check-links --local_changes');
  }

  if (buildTargetsInclude(Targets.DEV_DASHBOARD)) {
    runCheck('gulp dev-dashboard-tests');
  }

  if (buildTargetsInclude(Targets.OWNERS)) {
    runCheck('gulp check-owners');
  }

  if (buildTargetsInclude(Targets.PACKAGE_UPGRADE)) {
    runCheck('gulp check-exact-versions');
  }

  if (buildTargetsInclude(Targets.RENOVATE_CONFIG)) {
    runCheck('gulp check-renovate-config');
  }

  if (buildTargetsInclude(Targets.SERVER)) {
    runCheck('gulp server-tests');
  }

  if (buildTargetsInclude(Targets.RUNTIME)) {
    runCheck('gulp dep-check');
    runCheck('gulp check-types');
    runCheck('gulp check-sourcemaps');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.UNIT_TEST)) {
    runCheck('gulp unit --local_changes --headless');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    if (!argv.nobuild) {
      runCheck('gulp clean');
      runCheck('gulp dist --fortesting');
    }
    runCheck('gulp integration --nobuild --compiled --headless');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.VALIDATOR)) {
    runCheck('gulp validator');
  }

  if (buildTargetsInclude(Targets.VALIDATOR_WEBUI)) {
    runCheck('gulp validator-webui');
  }

  stopTimer(jobName, startTime);
}

module.exports = {
  prCheck,
};

prCheck.description = 'Runs a subset of the CI checks against local changes.';
prCheck.flags = {
  'nobuild': '  Skips building the runtime via `gulp dist`.',
};
