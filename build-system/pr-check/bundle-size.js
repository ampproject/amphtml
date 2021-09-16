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

const {
  abortTimedJob,
  downloadModuleOutput,
  downloadNomoduleOutput,
  printChangeSummary,
  printSkipMessage,
  startTimer,
  stopTimer,
  timedExecOrDie,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild, isTravisBuild} = require('../common/ci');
const {runNpmChecks} = require('./npm-checks');
const {setLoggingPrefix} = require('../common/logging');

const jobName = 'bundle-size.js';

async function main() {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);

  if (!runNpmChecks()) {
    return abortTimedJob(jobName, startTime);
  }

  // TODO(rsimha): Remove this block once Travis is shut off.
  if (isTravisBuild()) {
    printSkipMessage(
      jobName,
      'this is a Travis build. Sizes will be reported from CircleCI'
    );
  }

  if (!isPullRequestBuild()) {
    downloadNomoduleOutput();
    downloadModuleOutput();
    timedExecOrDie('gulp bundle-size --on_push_build');
  } else {
    printChangeSummary();
    const buildTargets = determineBuildTargets();
    if (buildTargets.has('RUNTIME') || buildTargets.has('FLAG_CONFIG')) {
      downloadNomoduleOutput();
      downloadModuleOutput();
      timedExecOrDie('gulp bundle-size --on_pr_build');
    } else {
      timedExecOrDie('gulp bundle-size --on_skipped_build');
      printSkipMessage(
        jobName,
        'this PR does not affect the runtime or flag configs'
      );
    }
  }

  stopTimer(jobName, startTime);
}

main();
