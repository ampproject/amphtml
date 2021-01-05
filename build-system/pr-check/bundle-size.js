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
 * This script downloads the module and nomodule builds then runs the bundle
 * size check.
 * This is run during the CI stage = test; job = Bundle Size.
 */

const colors = require('ansi-colors');
const log = require('fancy-log');
const {
  downloadEsmDistOutput,
  downloadDistOutput,
  printChangeSummary,
  startTimer,
  stopTimer,
  stopTimedJob,
  timedExecOrDie: timedExecOrDieBase,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');
const {runNpmChecks} = require('./npm-checks');

const FILENAME = 'bundle-size.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie = (cmd) => timedExecOrDieBase(cmd, FILENAME);

async function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  if (!runNpmChecks(FILENAME)) {
    stopTimedJob(FILENAME, startTime);
    return;
  }

  if (!isPullRequestBuild()) {
    downloadDistOutput(FILENAME);
    downloadEsmDistOutput(FILENAME);
    timedExecOrDie('gulp bundle-size --on_push_build');
  } else {
    printChangeSummary(FILENAME);
    const buildTargets = determineBuildTargets(FILENAME);
    if (buildTargets.has('RUNTIME') || buildTargets.has('FLAG_CONFIG')) {
      downloadDistOutput(FILENAME);
      downloadEsmDistOutput(FILENAME);
      timedExecOrDie('gulp bundle-size --on_pr_build');
    } else {
      timedExecOrDie('gulp bundle-size --on_skipped_build');
      log(
        `${FILELOGPREFIX} Skipping`,
        colors.cyan('Bundle Size'),
        'because this commit does not affect the runtime or flag configs.'
      );
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
