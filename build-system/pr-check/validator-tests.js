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
 * @fileoverview Script that runs the validator tests during CI.
 */

const {buildTargetsInclude, Targets} = require('./build-targets');
const {printSkipMessage, timedExecOrDie} = require('./utils');
const {runCiJob} = require('./ci-job');

const jobName = 'validator-tests.js';

function pushBuildWorkflow() {
  timedExecOrDie('amp validator-webui');
  timedExecOrDie('amp validator');
  timedExecOrDie('amp validator-cpp');
}

function prBuildWorkflow() {
  if (
    !buildTargetsInclude(
      Targets.RUNTIME,
      Targets.VALIDATOR,
      Targets.VALIDATOR_WEBUI
    )
  ) {
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime, validator, or validator web UI'
    );
    return;
  }

  if (buildTargetsInclude(Targets.VALIDATOR_WEBUI)) {
    timedExecOrDie('amp validator-webui');
  }

  if (buildTargetsInclude(Targets.RUNTIME, Targets.VALIDATOR)) {
    timedExecOrDie('amp validator');
  }

  if (buildTargetsInclude(Targets.VALIDATOR)) {
    timedExecOrDie('amp validator-cpp');
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
