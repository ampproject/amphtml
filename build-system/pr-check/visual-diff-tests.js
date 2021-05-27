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
 * @fileoverview Script that runs the visual diff tests during CI.
 */

const atob = require('atob');
const {runCiJob} = require('./ci-job');
const {skipDependentJobs, timedExecOrDie} = require('./utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'visual-diff-tests.js';

/**
 * Steps to run during push builds.
 */
function pushBuildWorkflow() {
  process.env['PERCY_TOKEN'] = atob(process.env.PERCY_TOKEN_ENCODED);
  timedExecOrDie('amp visual-diff --nobuild --main');
}

/**
 * Steps to run during PR builds.
 */
function prBuildWorkflow() {
  process.env['PERCY_TOKEN'] = atob(process.env.PERCY_TOKEN_ENCODED);
  if (buildTargetsInclude(Targets.RUNTIME, Targets.VISUAL_DIFF)) {
    timedExecOrDie('amp visual-diff --nobuild');
  } else {
    timedExecOrDie('amp visual-diff --empty');
    skipDependentJobs(
      jobName,
      'this PR does not affect the runtime or visual diff tests'
    );
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
