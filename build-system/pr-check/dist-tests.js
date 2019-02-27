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
 * This script runs the bundle size check and single pass test.
 * This is run during the CI stage = test; job = dist tests.
 */

const colors = require('ansi-colors');
const {
  downloadDistOutput,
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isTravisPullRequestBuild} = require('../travis');

const FILENAME = 'dist-tests.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie =
  (cmd, unusedFileName) => timedExecOrDieBase(cmd, FILENAME);

function runSinglePassTest_() {
  timedExecOrDie('gulp clean');
  timedExecOrDie('gulp update-packages');
  timedExecOrDie('gulp dist --fortesting --single_pass --pseudo_names');
  timedExecOrDie('gulp test --integration ' +
      '--nobuild --compiled --single_pass --headless');
}

function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  const buildTargets = determineBuildTargets();

  if (!isTravisPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    downloadDistOutput();
    timedExecOrDie('gulp bundle-size --on_push_build');
    runSinglePassTest_();
  } else {
    printChangeSummary(FILENAME);
    let ranTests = false;

    if (buildTargets.has('RUNTIME')) {
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp dist --fortesting --noextensions');
      timedExecOrDie('gulp bundle-size --on_pr_build');
      ranTests = true;
    } else {
      timedExecOrDie('gulp bundle-size --on_skipped_build');
    }

    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('INTEGRATION_TEST')) {

      runSinglePassTest_();
      ranTests = true;
    }

    if (!ranTests) {
      console.log(`${FILELOGPREFIX} Skipping ` +
          colors.cyan('Dist, Bundle Size, Single Pass Tests ') +
          'because this commit does not affect the runtime, build system, ' +
          'or integration test files.');
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
