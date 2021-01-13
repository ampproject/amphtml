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
 * on a local CI service VM.
 * This is run during the CI stage = test; job = nomodule tests.
 */

const colors = require('ansi-colors');
const {
  downloadNomoduleOutput,
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase,
  timedExecOrThrow: timedExecOrThrowBase,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');

const FILENAME = 'nomodule-tests.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie = (cmd) => timedExecOrDieBase(cmd, FILENAME);
const timedExecOrThrow = (cmd, msg) => timedExecOrThrowBase(cmd, FILENAME, msg);

function main() {
  const startTime = startTimer(FILENAME, FILENAME);

  if (!isPullRequestBuild()) {
    downloadNomoduleOutput(FILENAME);
    timedExecOrDie('gulp update-packages');

    try {
      timedExecOrThrow(
        'gulp integration --nobuild --headless --compiled --report',
        'Integration tests failed!'
      );
    } catch (e) {
      if (e.status) {
        process.exitCode = e.status;
      }
    } finally {
      timedExecOrDie('gulp test-report-upload');
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
        colors.cyan('Nomodule Tests'),
        'because this commit not affect the runtime, flag configs,',
        'or integration tests.'
      );
      stopTimer(FILENAME, FILENAME, startTime);
      return;
    }

    downloadNomoduleOutput(FILENAME);
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
