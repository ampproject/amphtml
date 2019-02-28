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
 *This script runs the unit and integration tests on a local Travis VM.
 * This is run during the CI stage = test; job = local tests.
 */

const colors = require('ansi-colors');
const {
  downloadBuildOutput,
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isTravisPullRequestBuild} = require('../travis');

const FILENAME = 'local-tests.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie =
  (cmd, unusedFileName) => timedExecOrDieBase(cmd, FILENAME);

function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  const buildTargets = determineBuildTargets();

  if (!isTravisPullRequestBuild()) {
    downloadBuildOutput(FILENAME);
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp test --integration --nobuild --headless --coverage');
    timedExecOrDie('gulp test --unit --nobuild --headless --coverage');
    //TODO(estherkim): turn on when stabilized :)
    //timedExecOrDie('gulp e2e --nobuild');
  } else {
    printChangeSummary(FILENAME);

    if (!(buildTargets.has('RUNTIME') ||
          buildTargets.has('BUILD_SYSTEM') ||
          buildTargets.has('UNIT_TEST') ||
          buildTargets.has('INTEGRATION_TEST'))) {
      console.log(
          `${FILELOGPREFIX} Skipping ` + colors.cyan('Local Tests ') +
          'because this commit not affect the runtime, build system, ' +
          'unit test files, or integration test files.');
      stopTimer(FILENAME, FILENAME, startTime);
      return;
    }
    downloadBuildOutput(FILENAME);
    timedExecOrDie('gulp update-packages');
    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('UNIT_TEST')) {
      timedExecOrDie('gulp test --nobuild --headless --local-changes');
    }

    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('INTEGRATION_TEST')) {
      timedExecOrDie('gulp test --integration --nobuild --headless --coverage');
    }

    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('UNIT_TEST')) {
      timedExecOrDie('gulp test --unit --nobuild --headless --coverage');
      //TODO(estherkim): turn on when stabilized :)
      //timedExecOrDie('gulp e2e --nobuild');
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
