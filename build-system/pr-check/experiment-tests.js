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
 * This script runs remote experiments tests.
 * This is run during the CI stage = test; job = experiments tests.
 */

const experimentsConfig = require('../global-configs/experiments-config.json');
const {
  downloadDistExperimentOutput,
  startTimer,
  startSauceConnect,
  stopTimer,
  stopSauceConnect,
  timedExecOrDie: timedExecOrDieBase,
} = require('./utils');
const {isTravisPullRequestBuild} = require('../travis');

const FILENAME = 'experiment-tests.js';
const timedExecOrDie = (cmd, unusedFileName) =>
  timedExecOrDieBase(cmd, FILENAME);

async function runExperimentTests_() {
  await startSauceConnect(FILENAME);
  Object.keys(experimentsConfig).forEach(experiment => {
    const config = experimentsConfig[experiment];
    if (config.command) {
      timedExecOrDie('gulp clean');
      downloadDistExperimentOutput(FILENAME, experiment);
      timedExecOrDie('gulp update-packages');
      timedExecOrDie('gulp integration --nobuild --compiled --saucelabs');
      timedExecOrDie('gulp e2e --nobuild --headless');
    }
  });
  stopSauceConnect(FILENAME);
}

async function main() {
  const startTime = startTimer(FILENAME, FILENAME);

  if (!isTravisPullRequestBuild()) {
    await runExperimentTests_();
  } else {
    //TODO(estherkim): remove this before merging
    await runExperimentTests_();
  }
  stopTimer(FILENAME, FILENAME, startTime);
}

main();
