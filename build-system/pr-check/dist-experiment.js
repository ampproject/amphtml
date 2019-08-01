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
 * This script builds the AMP runtime with experiment configs for production.
 * This is run during the CI stage = build; job = dist-experiment.
 */

const experimentsConfig = require('../global-configs/experiments-config.json');
const {
  startTimer,
  stopTimer,
  stopTimedJob,
  timedExecOrDie: timedExecOrDieBase,
  uploadDistExperimentOutput,
} = require('./utils');
const {isTravisPullRequestBuild} = require('../travis');
const {runYarnChecks} = require('./yarn-checks');
const FILENAME = 'dist-experiment.js';
const timedExecOrDie = (cmd, unusedFileName) =>
  timedExecOrDieBase(cmd, FILENAME);

function buildAndUploadExperiments_() {
  Object.keys(experimentsConfig).forEach(experiment => {
    const config = experimentsConfig[experiment];
    if (config.command) {
      timedExecOrDie('gulp clean');
      timedExecOrDie('gulp update-packages');
      timedExecOrDie(config.command);
      uploadDistExperimentOutput(FILENAME, experiment);
    }
  });
}

async function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  if (!runYarnChecks(FILENAME)) {
    stopTimedJob(FILENAME, startTime);
    return;
  }

  if (!isTravisPullRequestBuild()) {
    buildAndUploadExperiments_();
  } else {
    //TODO(estherkim): remove this before merging
    buildAndUploadExperiments_();
  }
  stopTimer(FILENAME, FILENAME, startTime);
}

main();
