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
 * This script builds and tests the AMP runtime in single pass mode.
 * This is run during the CI stage = test; job = single pass tests.
 */

const colors = require('ansi-colors');
const {
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isTravisPullRequestBuild} = require('../travis');

const FILENAME = 'single-pass-tests.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie = (cmd, unusedFileName) =>
  timedExecOrDieBase(cmd, FILENAME);

function main() {
  const startTime = startTimer(FILENAME, FILENAME);

  if (!isTravisPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp dist --fortesting --single_pass --pseudo_names');
    timedExecOrDie(
      'gulp test --integration --nobuild --compiled --single_pass --headless'
    );
  } else {
    printChangeSummary(FILENAME);
    const buildTargets = new Set();
    determineBuildTargets(buildTargets, FILENAME);

    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('INTEGRATION_TEST')
    ) {
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp dist --fortesting --single_pass --pseudo_names');
      timedExecOrDie(
        'gulp test --integration ' +
          '--nobuild --compiled --single_pass --headless'
      );
    } else {
      console.log(
        `${FILELOGPREFIX} Skipping`,
        colors.cyan('Single Pass Tests'),
        'because this commit does not affect the runtime, flag configs,',
        'or integration tests.'
      );
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
