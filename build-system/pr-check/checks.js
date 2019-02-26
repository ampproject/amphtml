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
 * @fileoverview
 * This script performs quick checks on the source code
 * prior to running unit and integration tests.
 * This is run during the CI stage = build; job = checks.
 */

const {
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isTravisPullRequestBuild} = require('../travis');

const FILENAME = 'checks.js';
const timedExecOrDie =
  (cmd, unusedFileName) => timedExecOrDieBase(cmd, FILENAME);

function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  const buildTargets = determineBuildTargets();

  timedExecOrDie('gulp update-packages');
  timedExecOrDie('gulp presubmit');
  timedExecOrDie('gulp lint');

  if (!isTravisPullRequestBuild()) {
    timedExecOrDie('gulp ava');
    timedExecOrDie('node node_modules/jest/bin/jest.js');
    timedExecOrDie('gulp caches-json');
    timedExecOrDie('gulp json-syntax');
    timedExecOrDie('gulp dep-check');
    timedExecOrDie('gulp check-types');
  } else {
    printChangeSummary(FILENAME);
    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM')) {

      timedExecOrDie('gulp ava');
      timedExecOrDie('node node_modules/jest/bin/jest.js');
    }

    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('UNIT_TEST') ||
        buildTargets.has('INTEGRATION_TEST')) {

      timedExecOrDie('gulp caches-json');
      timedExecOrDie('gulp json-syntax');
      timedExecOrDie('gulp dep-check');
      timedExecOrDie('gulp check-types');
    }

    if (buildTargets.has('DOCS')) {
      timedExecOrDie('gulp check-links');
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
