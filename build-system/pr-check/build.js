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
 * This is run during the CI stage = build; job = build.
 */

const colors = require('ansi-colors');
const {
  areValidBuildTargets,
  determineBuildTargets} = require('./build-targets');
const {
  isYarnLockFileInSync,
  isYarnLockFileProperlyUpdated} = require('./yarn-checks');
const {
  printChangeSummary,
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase,
  uploadBuildOutput} = require('./utils');
const {isTravisPullRequestBuild} = require('../travis');
const FILENAME = 'build.js';
const FILELOGPREFIX = colors.bold(colors.yellow(`${FILENAME}:`));
const timedExecOrDie =
  (cmd, unusedFileName) => timedExecOrDieBase(cmd, FILENAME);

function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  // Make sure package.json and yarn.lock are in sync and up-to-date.
  if (!isYarnLockFileInSync(FILENAME) ||
      !isYarnLockFileProperlyUpdated(FILENAME)) {
    process.exitCode = 1;
    return;
  }

  const buildTargets = determineBuildTargets();
  if (!areValidBuildTargets(buildTargets, FILENAME)) {
    stopTimer(FILENAME, FILENAME, startTime);
    process.exitCode = 1;
    return;
  }

  if (!isTravisPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp build --fortesting');
    uploadBuildOutput(FILENAME);
  } else {
    printChangeSummary(FILENAME);
    if (buildTargets.has('RUNTIME') ||
        buildTargets.has('UNIT_TEST') ||
        buildTargets.has('INTEGRATION_TEST') ||
        buildTargets.has('BUILD_SYSTEM') ||
        buildTargets.has('FLAG_CONFIG') ||
        buildTargets.has('VISUAL_DIFF')) {

      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp build --fortesting');
      uploadBuildOutput(FILENAME);
    } else {
      console.log(`${FILELOGPREFIX} Skipping ` + colors.cyan('Build ') +
          'because this commit does not affect the runtime, build system, ' +
          'test files, or visual diff files');
    }
  }

  stopTimer(FILENAME, FILENAME, startTime);
}

main();
