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

const {
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase,
  unzipBuildOutput} = require('./utils');
const {determineBuildTargets} = require('./build-target');
const {isTravisPushBuild} = require('../travis');

const FILENAME = 'local-test.js';
const timedExecOrDie =
  (cmd, unusedFunctionName) => timedExecOrDieBase(cmd, FILENAME);

function main() {
  const startTime = startTimer(FILENAME);
  const buildTargets = determineBuildTargets();
  unzipBuildOutput();
  if (isTravisPushBuild()) {
    timedExecOrDie('gulp test --integration --nobuild --coverage');
    timedExecOrDie('gulp test --unit --nobuild --headless --coverage');
    timedExecOrDie('gulp test --dev_dashboard --nobuild');
    //TODO(estherkim): turn on when stabilized :)
    //timedExecOrDie('gulp e2e --nobuild');
  }
  else {
    let ranTests = false;

    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('UNIT_TEST')) {

      timedExecOrDie('gulp test --nobuild --headless --local-changes');
      ranTests = true;
    }

    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('INTEGRATION_TEST')) {

      timedExecOrDie('gulp test --integraton --nobuild --headless --coverage');
      ranTests = true;
    }

    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM')) {

      timedExecOrDie('gulp test --unit --nobuild --headless --coverage');
      //TODO(estherkim): turn on when stabilized :)
      //timedExecOrDie('gulp e2e --nobuild');
      ranTests = true;
    }

    if (buildTargets.has('DEV_DASHBOARD')) {
      timedExecOrDie('gulp test --dev_dashboard --nobuild');
      ranTests = true;
    }

    if (!ranTests) {
      console.log('Skipping unit and integration tests because ' +
        'this commit not affect the runtime, build system, ' +
        'unit test files, integration test files, or the dev dashboard.');
    }
  }

  stopTimer(FILENAME, startTime);
  return 0;
}

process.exit(main());
