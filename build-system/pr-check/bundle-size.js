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

const {runCiJob} = require('./ci-job');
const {skipDependentJobs, timedExecOrDie} = require('./utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'bundle-size.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  timedExecOrDie('amp dist --noconfig --esm');
  timedExecOrDie('amp dist --noconfig');
  timedExecOrDie('amp bundle-size --on_push_build');
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME)) {
    timedExecOrDie('amp dist --noconfig --esm');
    timedExecOrDie('amp dist --noconfig');
    timedExecOrDie('amp bundle-size --on_pr_build');
  } else {
    timedExecOrDie('amp bundle-size --on_skipped_build');
    skipDependentJobs(jobName, 'this PR does not affect the runtime');
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
