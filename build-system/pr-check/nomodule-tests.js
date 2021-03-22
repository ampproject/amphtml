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

const argv = require('minimist')(process.argv.slice(2));
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
  const targets = MINIFIED_TARGETS.flatMap((target) => [
    `dist/${target}.js`,
  ]).join(',');
  timedExecOrDie(
    `amp prepend-global --${argv.config} --local_dev --fortesting --derandomize --target=${targets}`
  );
}

function pushBuildWorkflow() {
  downloadNomoduleOutput();
  prependConfig();
  try {
    timedExecOrThrow(
      `amp integration --nobuild --headless --compiled --report --config=${argv.config}`,
      'Integration tests failed!'
    );
  } catch (e) {
    if (e.status) {
      process.exitCode = e.status;
    }
  } finally {
    timedExecOrDie('amp test-report-upload');
  }
}

function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME, Targets.INTEGRATION_TEST)) {
    downloadNomoduleOutput();
    prependConfig();
    timedExecOrDie(
      `amp integration --nobuild --compiled --headless --config=${argv.config}`
    );
  } else {
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime or integration tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
