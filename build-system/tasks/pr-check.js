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
 */
async function prCheck() {
  setLoggingPrefix(jobName);

  const failTask = () => {
    stopTimer(jobName, startTime);
    throw new Error('Local PR check failed. See logs above.');
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
    runCheck('amp presubmit');
  }

  if (buildTargetsInclude(Targets.LINT)) {
    runCheck('amp lint --local_changes');
  }

  if (buildTargetsInclude(Targets.PRETTIFY)) {
    runCheck('amp prettify --local_changes');
  }

  if (buildTargetsInclude(Targets.AVA)) {
    runCheck('amp ava');
  }

  if (buildTargetsInclude(Targets.BABEL_PLUGIN)) {
    runCheck('amp babel-plugin-tests');
  }

  if (buildTargetsInclude(Targets.CACHES_JSON)) {
    runCheck('amp caches-json');
  }

  if (buildTargetsInclude(Targets.DOCS)) {
    runCheck('amp check-links --local_changes');
  }

  if (buildTargetsInclude(Targets.DEV_DASHBOARD)) {
    runCheck('amp dev-dashboard-tests');
  }

  if (buildTargetsInclude(Targets.OWNERS)) {
    runCheck('amp check-owners');
  }

  if (buildTargetsInclude(Targets.PACKAGE_UPGRADE)) {
    runCheck('amp check-exact-versions');
  }

  if (buildTargetsInclude(Targets.RENOVATE_CONFIG)) {
    runCheck('amp check-renovate-config');
  }

  if (buildTargetsInclude(Targets.SERVER)) {
    runCheck('amp server-tests');
  }

  if (buildTargetsInclude(Targets.RUNTIME)) {
    runCheck('amp dep-check');
    runCheck('amp check-types');
    runCheck('amp check-sourcemaps');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.UNIT_TEST)) {
    runCheck('amp unit --local_changes --headless');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    if (!argv.nobuild) {
      runCheck('amp clean');
      runCheck('amp dist --fortesting');
    }
    runCheck('amp integration --nobuild --compiled --headless');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.VALIDATOR)) {
    runCheck('amp validator');
  }

  if (buildTargetsInclude(Targets.VALIDATOR_WEBUI)) {
    runCheck('amp validator-webui');
  }

  stopTimer(jobName, startTime);
}

module.exports = {
  prCheck,
};

prCheck.description = 'Runs a subset of the CI checks against local changes.';
prCheck.flags = {
  'nobuild': 'Skips building the runtime via `amp dist`.',
};
