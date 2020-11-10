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
 * This script builds the AMP runtime.
 * This is run during the CI stage = build; job = Unminified Build.
 */

const colors = require('ansi-colors');
const log = require('fancy-log');
const {
  printChangeSummary,
  startTimer,
  stopTimer,
  stopTimedJob,
  timedExecOrDie: timedExecOrDieBase,
  uploadBuildOutput,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isTravisPullRequestBuild} = require('../common/travis');
const {runNpmChecks} = require('./npm-checks');

const FILENAME = 'unminified-build.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie = (cmd) => timedExecOrDieBase(cmd, FILENAME);

function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  if (!runNpmChecks(FILENAME)) {
    stopTimedJob(FILENAME, startTime);
    return;
  }

  if (!isTravisPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp build --fortesting');
    uploadBuildOutput(FILENAME);
  } else {
    printChangeSummary(FILENAME);
    const buildTargets = determineBuildTargets(FILENAME);
    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('INTEGRATION_TEST') ||
      buildTargets.has('UNIT_TEST')
    ) {
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp build --fortesting');
      uploadBuildOutput(FILENAME);
    } else {
      log(
        `${FILELOGPREFIX} Skipping`,
        colors.cyan('Unminified Build'),
        'because this commit does not affect the runtime, flag configs,',
        'or integration tests.'
      );
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
