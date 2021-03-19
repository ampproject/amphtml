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
 * @fileoverview Script that runs the bundle-size checks during CI.
 */

const {
  downloadModuleOutput,
  downloadNomoduleOutput,
  printSkipMessage,
  timedExecOrDie,
} = require('./utils');
const {buildTargetsInclude, Targets} = require('./build-targets');
const {runCiJob} = require('./ci-job');

const jobName = 'bundle-size.js';

function pushBuildWorkflow() {
  downloadNomoduleOutput();
  downloadModuleOutput();
  timedExecOrDie('amp bundle-size --on_push_build');
}

function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME)) {
    downloadNomoduleOutput();
    downloadModuleOutput();
    timedExecOrDie('amp bundle-size --on_pr_build');
  } else {
    timedExecOrDie('amp bundle-size --on_skipped_build');
    printSkipMessage(
      jobName,
      'this PR does not affect the runtime or flag configs'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
