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
 * @fileoverview Script that builds and tests on Linux, macOS, and Windows during CI.
 */

const {runCiJob} = require('./ci-job');
const {timedExecOrDie} = require('./utils');

const jobName = 'cross-browser-tests.js';

/**
 * @return {Promise<void>}
 */
async function prBuildWorkflow() {
  console.log('starting prBuildWorkflow');
  timedExecOrDie('where amp');
  timedExecOrDie('node amp.js clean');
  timedExecOrDie('amp clean');
  timedExecOrDie('amp update-packages');
}

runCiJob(jobName, () => {}, prBuildWorkflow);
