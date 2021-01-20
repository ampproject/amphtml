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
 * This script builds an experiment binary and runs local tests.
 * This is run during the CI stage = test; job = experiments tests.
 */

const experimentsConfig = require('../global-configs/experiments-config.json');
const {
  printSkipMessage,
  startTimer,
  stopTimer,
  timedExecOrDie,
} = require('./utils');
const {experiment} = require('minimist')(process.argv.slice(2));
const {setLoggingPrefix} = require('../common/logging');

const jobName = `${experiment}-tests.js`;

function getConfig_() {
  const config = experimentsConfig[experiment];

  if (!config || !config.name || !config.define_experiment_constant) {
    return;
  }

  if (new Date(config['expiration_date_utc']) < Date.now()) {
    return;
  }

  return config;
}

function build_(config) {
  const command = `gulp dist --fortesting --define_experiment_constant ${config.define_experiment_constant}`;
  timedExecOrDie('gulp clean');
  timedExecOrDie('gulp update-packages');
  timedExecOrDie(command);
}

function test_() {
  timedExecOrDie('gulp integration --nobuild --compiled --headless');
  timedExecOrDie('gulp e2e --nobuild --compiled --headless');
}

function main() {
  setLoggingPrefix(jobName);
  const startTime = startTimer(jobName);
  const config = getConfig_();
  if (config) {
    build_(config);
    test_();
  } else {
    printSkipMessage(
      jobName,
      `${experiment} is expired, misconfigured, or does not exist`
    );
  }
  stopTimer(jobName, startTime);
}

main();
