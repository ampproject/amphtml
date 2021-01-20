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
 * This script builds the minified AMP runtime.
 * This is run during the CI stage = build; job = Nomodule Build.
 */

const {
  stopTimedJob,
  printChangeSummary,
  printSkipMessage,
  processAndUploadNomoduleOutput,
  startTimer,
  stopTimer,
  timedExecWithError,
  timedExecOrDie,
  uploadNomoduleOutput,
} = require('./utils');
const {determineBuildTargets} = require('./build-targets');
const {isPullRequestBuild} = require('../common/ci');
const {log} = require('../common/logging');
const {red, yellow} = require('ansi-colors');
const {runNpmChecks} = require('./npm-checks');
const {setLoggingPrefix} = require('../common/logging');
const {signalDistUpload} = require('../tasks/pr-deploy-bot-utils');

const jobName = 'nomodule-build.js';

async function main() {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);
  if (!runNpmChecks()) {
    return stopTimedJob(jobName, startTime);
  }

  if (!isPullRequestBuild()) {
    timedExecOrDie('gulp update-packages');
    timedExecOrDie('gulp dist --fortesting');
    uploadNomoduleOutput();
  } else {
    printChangeSummary();
    const buildTargets = determineBuildTargets();
    if (
      buildTargets.has('RUNTIME') ||
      buildTargets.has('FLAG_CONFIG') ||
      buildTargets.has('INTEGRATION_TEST') ||
      buildTargets.has('E2E_TEST') ||
      buildTargets.has('VISUAL_DIFF') ||
      buildTargets.has('UNIT_TEST')
    ) {
      timedExecOrDie('gulp update-packages');
      const process = timedExecWithError('gulp dist --fortesting');
      if (process.status !== 0) {
        const error = process.error || new Error('unknown error, check logs');
        log(red('ERROR'), yellow(error.message));
        await signalDistUpload('errored');
        return stopTimedJob(jobName, startTime);
      }
      timedExecOrDie('gulp storybook --build');
      await processAndUploadNomoduleOutput();
    } else {
      await signalDistUpload('skipped');
      printSkipMessage(
        jobName,
        'this PR does not affect the runtime, flag configs, integration ' +
          'tests, end-to-end tests, or visual diff tests'
      );
    }
  }

  stopTimer(jobName, startTime);
}

main();
