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
  timedExecOrDie: timedExecOrDieBase,
} = require('../pr-check/utils');
const {determineBuildTargets} = require('../pr-check/build-targets');

const FILENAME = 'pr-check.js';
const timedExecOrDie = (cmd, unusedFileName) =>
  timedExecOrDieBase(cmd, FILENAME);

/**
 * This file runs tests against the local workspace to mimic the CI build as
 * closely as possible.
 */
async function prCheck() {
  printChangeSummary(FILENAME);

  const buildTargets = determineBuildTargets();

  timedExecOrDie('gulp presubmit');
  timedExecOrDie('gulp lint --local-changes');
  timedExecOrDie('gulp ava');
  timedExecOrDie('node node_modules/jest/bin/jest.js');
  timedExecOrDie('gulp caches-json');
  timedExecOrDie('gulp json-syntax');

  if (buildTargets.has('DOCS')) {
    timedExecOrDie('gulp check-links');
  }

  if (buildTargets.has('RUNTIME')) {
    timedExecOrDie('gulp dep-check');
    timedExecOrDie('gulp check-types');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('UNIT_TEST')) {
    timedExecOrDie('gulp test --unit --local-changes --headless');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('INTEGRATION_TEST')) {
    if (!argv.nobuild) {
      timedExecOrDie('gulp clean');
      timedExecOrDie('gulp dist --fortesting');
    }
    timedExecOrDie('gulp test --nobuild --integration --headless');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('VALIDATOR')) {
    timedExecOrDie('gulp validator');
  }

  if (buildTargets.has('RUNTIME') || buildTargets.has('VALIDATOR_WEBUI')) {
    timedExecOrDie('gulp validator-webui');
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
