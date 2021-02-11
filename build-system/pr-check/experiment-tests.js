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
 * @fileoverview Script that runs the experiment A/B/C tests during CI.
 */

const experimentsConfig = require('../global-configs/experiments-config.json');
const {buildTargetsInclude, Targets} = require('./build-targets');
const {experiment} = require('minimist')(process.argv.slice(2));
const {printSkipMessage, timedExecOrDie} = require('./utils');
const {runCiJob} = require('./ci-job');

const jobName = `${experiment}-tests.js`;

/**
 * Extracts and validates the experiment config.
 * @return {Object|null}
 */
function getConfig_() {
  const config = experimentsConfig[experiment];
  const valid =
    config?.name &&
    config?.define_experiment_constant &&
    config?.expiration_date_utc &&
    new Date(config.expiration_date_utc) >= Date.now();
  return valid ? config : null;
}

function pushBuildWorkflow() {
  const config = getConfig_();
  if (config) {
    const defineFlag = `--define_experiment_constant ${config.define_experiment_constant}`;
    const experimentFlag = `--experiment ${experiment}`;
    timedExecOrDie('gulp update-packages');
    timedExecOrDie(`gulp dist --fortesting ${defineFlag}`);
    timedExecOrDie(
      `gulp integration --nobuild --compiled --headless ${experimentFlag} ${defineFlag}`
    );
    timedExecOrDie(
      `gulp e2e --nobuild --compiled --headless ${experimentFlag} ${defineFlag}`
    );
  } else {
    printSkipMessage(
      jobName,
      `${experiment} is expired, misconfigured, or does not exist`
    );
  }
}

function prBuildWorkflow() {
  if (
    buildTargetsInclude(
      Targets.RUNTIME,
      Targets.INTEGRATION_TEST,
      Targets.E2E_TEST
    )
  ) {
    pushBuildWorkflow();
  } else {
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime, integration tests, or end-to-end tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
