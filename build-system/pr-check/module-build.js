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
 * This script builds the esm minified AMP runtime.
 * This is run during the CI stage = build; job = Module Build.
 */

const colors = require('ansi-colors');
const log = require('fancy-log');
const {
  printChangeSummary,
  startTimer,
  stopTimer,
  stopTimedJob,
  timedExecOrDie: timedExecOrDieBase,
  uploadEsmDistOutput,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');
const {runNpmChecks} = require('./npm-checks');

const FILENAME = 'module-build.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie = (cmd) => timedExecOrDieBase(cmd, FILENAME);

function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  if (!runNpmChecks(FILENAME)) {
    stopTimedJob(FILENAME, startTime);
    return;
  }

  if (!isPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp dist --esm --fortesting');
    uploadEsmDistOutput(FILENAME);
  } else {
    printChangeSummary(FILENAME);
    const buildTargets = determineBuildTargets(FILENAME);
    // TODO(#31102): This list must eventually match the same buildTargets check
    // found in pr-check/nomodule-build.js as we turn on the systems that
    // run against the module build. (ex. visual diffs, e2e, etc.)
    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('INTEGRATION_TEST')
    ) {
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp dist --esm --fortesting');
      uploadEsmDistOutput(FILENAME);
    } else {
      log(
        `${FILELOGPREFIX} Skipping`,
        colors.cyan('Module Build'),
        'because this commit does not affect the runtime or flag configs.'
      );
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
