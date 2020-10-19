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
  printChangeSummary,
  startTimer,
  stopTimer,
  stopTimedJob,
  timedExec,
} = require('../pr-check/utils');
const {determineBuildTargets} = require('../pr-check/build-targets');
const {runNpmChecks} = require('../pr-check/npm-checks');

const FILENAME = 'pr-check.js';

/**
 * This file runs tests against the local workspace to mimic the CI build as
 * closely as possible.
 * @param {Function} cb
 */
async function prCheck(cb) {
  const failTask = () => {
    stopTimer(FILENAME, FILENAME, startTime);
    const err = new Error('Local PR check failed. See logs above.');
    err.showStack = false;
    cb(err);
  };

  const runCheck = (cmd) => {
    const {status} = timedExec(cmd, FILENAME);
    if (status != 0) {
      failTask();
    }
  };

  const startTime = startTimer(FILENAME, FILENAME);
  if (!runNpmChecks(FILENAME)) {
    stopTimedJob(FILENAME, startTime);
    return;
  }

  printChangeSummary(FILENAME);
  const buildTargets = determineBuildTargets(FILENAME);
  runCheck('gulp lint --local_changes');
  runCheck('gulp prettify --local_changes');
  runCheck('gulp presubmit');
  runCheck('gulp check-exact-versions');

  if (buildTargets.has('AVA')) {
    runCheck('gulp ava');
  }

  if (buildTargets.has('BABEL_PLUGIN')) {
    runCheck('gulp babel-plugin-tests');
  }

  if (buildTargets.has('CACHES_JSON')) {
    runCheck('gulp caches-json');
  }

  if (buildTargets.has('DOCS')) {
    runCheck('gulp check-links --local_changes');
  }

  if (buildTargets.has('DEV_DASHBOARD')) {
    runCheck('gulp dev-dashboard-tests');
  }

  if (buildTargets.has('OWNERS')) {
    runCheck('gulp check-owners');
  }

  if (buildTargets.has('RENOVATE_CONFIG')) {
    runCheck('gulp check-renovate-config');
  }

  if (buildTargets.has('SERVER')) {
    runCheck('gulp server-tests');
  }

  if (buildTargets.has('RUNTIME')) {
    runCheck('gulp dep-check');
    runCheck('gulp check-types');
    runCheck('gulp check-sourcemaps');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('UNIT_TEST')) {
    runCheck('gulp unit --local_changes --headless');
  }

  if (
    buildTargets.has('RUNTIME') ||
    buildTargets.has('FLAG_CONFIG') ||
    buildTargets.has('INTEGRATION_TEST')
  ) {
    if (!argv.nobuild) {
      runCheck('gulp clean');
      runCheck('gulp dist --fortesting');
    }
    runCheck('gulp integration --nobuild --compiled --headless');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('VALIDATOR')) {
    runCheck('gulp validator');
  }

  if (buildTargets.has('VALIDATOR_WEBUI')) {
    runCheck('gulp validator-webui');
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

module.exports = {
  prCheck,
};

prCheck.description =
  'Runs a subset of the Travis CI checks against local changes.';
prCheck.flags = {
  'nobuild': '  Skips building the runtime via `gulp dist`.',
};
