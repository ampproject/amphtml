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
 * This script kicks off the unit and integration tests on Sauce Labs.
 * This is run during the CI stage = test; job = remote tests.
 */

const colors = require('ansi-colors');
const {
  downloadBuildOutput,
  downloadDistOutput,
  printChangeSummary,
  startTimer,
  stopTimer,
  startSauceConnect,
  stopSauceConnect,
  timedExecOrDie: timedExecOrDieBase} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isTravisPullRequestBuild} = require('../travis');

const FILENAME = 'remote-tests.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie =
  (cmd, unusedFileName) => timedExecOrDieBase(cmd, FILENAME);

async function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  const buildTargets = determineBuildTargets();

  if (!isTravisPullRequestBuild()) {
    downloadDistOutput(FILENAME);
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp e2e --nobuild');
    await startSauceConnect(FILENAME);
    timedExecOrDie('gulp test --unit --nobuild --saucelabs_lite');
    timedExecOrDie('gulp test --integration --nobuild --compiled --saucelabs');

    stopSauceConnect(FILENAME);
  } else {
    printChangeSummary(FILENAME);
    timedExecOrDie('gulp e2e --nobuild');
    if (!(buildTargets.has('RUNTIME') ||
          buildTargets.has('BUILD_SYSTEM') ||
          buildTargets.has('UNIT_TEST') ||
          buildTargets.has('INTEGRATION_TEST'))) {
      console.log(
          `${FILELOGPREFIX} Skipping ` +
          colors.cyan('Remote (Sauce Labs) Tests ') +
          'because this commit does not affect the runtime, ' +
          'build system, or integration test files.');
      stopTimer(FILENAME, FILENAME, startTime);
      return;
    }
    downloadBuildOutput(FILENAME);
    timedExecOrDie('gulp update-packages');
    await startSauceConnect(FILENAME);

    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('UNIT_TEST')) {
      timedExecOrDie('gulp test --unit --nobuild --saucelabs_lite');
    }

    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('INTEGRATION_TEST')) {
      timedExecOrDie('gulp test --integration --nobuild --saucelabs');
    }
    stopSauceConnect(FILENAME);
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
