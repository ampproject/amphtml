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
const {determineBuildTargets} = require('../pr-check/build-targets');
const {printChangeSummary, timedExec} = require('../pr-check/utils');

const FILENAME = 'pr-check.js';

/**
 * This file runs tests against the local workspace to mimic the CI build as
 * closely as possible.
 * @param {Function} cb
 */
async function prCheck(cb) {
  const runCheck = cmd => {
    const {status} = timedExec(cmd, FILENAME);
    if (status != 0) {
      const err = new Error('Local PR check failed. See logs above.');
      err.showStack = false;
      cb(err);
    }
  };

  printChangeSummary(FILENAME);

  const buildTargets = determineBuildTargets();

  runCheck('gulp lint --local-changes');
  runCheck('gulp presubmit');
  runCheck('gulp ava');
  runCheck('node node_modules/jest/bin/jest.js');
  runCheck('gulp caches-json');
  runCheck('gulp json-syntax');

  if (buildTargets.has('DOCS')) {
    runCheck('gulp check-links');
  }

  if (buildTargets.has('RUNTIME')) {
    runCheck('gulp dep-check');
    runCheck('gulp check-types');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('UNIT_TEST')) {
    runCheck('gulp test --unit --local-changes --headless');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('INTEGRATION_TEST')) {
    if (!argv.nobuild) {
      runCheck('gulp clean');
      runCheck('gulp dist --fortesting');
    }
    runCheck('gulp test --nobuild --integration --headless');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('VALIDATOR')) {
    runCheck('gulp validator');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('VALIDATOR_WEBUI')) {
    runCheck('gulp validator-webui');
  }
}

module.exports = {
  prCheck,
};

prCheck.description =
  'Runs a subset of the Travis CI checks against local changes.';
prCheck.flags = {
  'nobuild': '  Skips building the runtime via `gulp dist`.',
};
