/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 * This script runs the unit and integration tests against minified code
 * on a local Travis VM.
 * This is run during the CI stage = test; job = dist tests.
 */

const colors = require('ansi-colors');
const {
  downloadDistOutput,
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase,
  timedExec: timedExecBase,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isTravisPullRequestBuild} = require('../common/travis');

const FILENAME = 'dist-tests.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie = (cmd) => timedExecOrDieBase(cmd, FILENAME);
const timedExec = (cmd) => timedExecBase(cmd, FILENAME);

function main() {
  const startTime = startTimer(FILENAME, FILENAME);

  // NO SUBMIT PLZ
  if (true || !isTravisPullRequestBuild()) {
    downloadDistOutput(FILENAME);
    timedExecOrDie('gulp update-packages');

    const {status} = timedExec(
      'gulp integration --nobuild --headless --compiled'
    );

    timedExecOrDie('gulp test-report-upload');
    if (status) {
      process.exit(status);
    }
  } else {
    printChangeSummary(FILENAME);
    const buildTargets = determineBuildTargets(FILENAME);
    if (
      !buildTargets.has('RUNTIME') &&
      !buildTargets.has('FLAG_CONFIG') &&
      !buildTargets.has('INTEGRATION_TEST')
    ) {
      console.log(
        `${FILELOGPREFIX} Skipping`,
        colors.cyan('Dist Tests'),
        'because this commit not affect the runtime, flag configs,',
        'or integration tests.'
      );
      stopTimer(FILENAME, FILENAME, startTime);
      return;
    }

    downloadDistOutput(FILENAME);
    timedExecOrDie('gulp update-packages');

    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('INTEGRATION_TEST')
    ) {
      timedExecOrDie('gulp integration --nobuild --headless --compiled');
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
