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
 * This script runs end to end tests.
 * This is run during the CI stage = test; job = e2e tests.
 */

const colors = require('ansi-colors');
const {
  downloadBuildOutput,
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isTravisPullRequestBuild} = require('../travis');

const FILENAME = 'e2e-tests.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie = (cmd, unusedFileName) =>
  timedExecOrDieBase(cmd, FILENAME);

async function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  const buildTargets = determineBuildTargets(FILENAME);

  if (!isTravisPullRequestBuild()) {
    downloadBuildOutput(FILENAME);
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp e2e --nobuild --headless');
  } else {
    printChangeSummary(FILENAME);
    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('E2E_TEST')
    ) {
      downloadBuildOutput(FILENAME);
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp e2e --nobuild --headless');
    } else {
      console.log(
        `${FILELOGPREFIX} Skipping`,
        colors.cyan('End to End Tests'),
        'because this commit does not affect the runtime, flag configs,',
        'or end-to-end tests'
      );
    }
  }
  stopTimer(FILENAME, FILENAME, startTime);
}

main();
