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
 * This script runs the visual diff tests.
 * This is run during the CI stage = test; job = visual diff tests.
 */

const atob = require('atob');
const {
  downloadBuildOutput,
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase} = require('./utils');
const {determineBuildTargets} = require('./build-target');
const {isTravisPullRequestBuild} = require('../travis');

const FILENAME = 'visual-diff-tests.js';
const timedExecOrDie =
  (cmd, unusedFileName) => timedExecOrDieBase(cmd, FILENAME);

function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  const buildTargets = determineBuildTargets();
  printChangeSummary(FILENAME);

  if (!isTravisPullRequestBuild()) {
    downloadBuildOutput(FILENAME);
    process.env['PERCY_TOKEN'] = atob(process.env.PERCY_TOKEN_ENCODED);
    timedExecOrDie('gulp visual-diff --nobuild --master');
  } else {
    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('INTEGRATION_TEST') ||
        buildTargets.has('VISUAL_DIFF') ||
        buildTargets.has('FLAG_CONFIG')) {

      downloadBuildOutput(FILENAME);
      process.env['PERCY_TOKEN'] = atob(process.env.PERCY_TOKEN_ENCODED);
      timedExecOrDie('gulp visual-diff --nobuild');
    } else {
      timedExecOrDie('gulp visual-diff --nobuild --empty');
      console.log('Skipping visual diff tests because this commit does ' +
        'not affect the runtime, build system, integration test files, ' +
        'visual diff test files, or flag config files.');
    }
  }

  stopTimer(FILENAME, startTime);
  return 0;
}

process.exit(main());
