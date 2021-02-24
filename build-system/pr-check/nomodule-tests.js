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
 * @fileoverview Script that tests the nomodule AMP runtime during CI.
 */

const {
  downloadNomoduleOutput,
  printSkipMessage,
  timedExecOrDie,
  timedExecOrThrow,
} = require('./utils');
const {buildTargetsInclude, Targets} = require('./build-targets');
const {MINIFIED_TARGETS} = require('../tasks/helpers');
const {runCiJob} = require('./ci-job');

const jobName = 'nomodule-tests.js';

function prependConfig() {
  // TODO(@ampproject/wg-infra): change prepend-global to take multiple target files instead of looping here.
  for (const target of MINIFIED_TARGETS) {
    timedExecOrDie(
      `gulp prepend-global --${process.env.config} --local_dev --fortesting --derandomize --target=dist/${target}.js`
    );
  }
}

function pushBuildWorkflow() {
  downloadNomoduleOutput();
  timedExecOrDie('gulp update-packages');
  prependConfig();
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
}

function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    downloadNomoduleOutput();
    timedExecOrDie('gulp update-packages');
    prependConfig();
    timedExecOrDie('gulp integration --nobuild --compiled --headless');
  } else {
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
