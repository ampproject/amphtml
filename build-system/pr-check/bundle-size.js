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

const {cyan, green, red} = require('../common/colors');
const {execScriptAsync} = require('../common/exec');
const {log} = require('../common/logging');
const {runCiJob} = require('./ci-job');
const {skipDependentJobs, timedExecOrDie} = require('./utils');
const {Targets, buildTargetsInclude} = require('./build-targets');

const jobName = 'bundle-size.js';

/**
 * Builds both Module and Nomodule builds of AMP in parallel.
 * @return {Promise<void>}
 */
async function buildModuleNomodule() {
  const buildPromises = [];
  ['--esm', '--no-esm'].forEach((esmFlag) => {
    let resolver, rejecter;
    const deferred = new Promise((resolverIn, rejecterIn) => {
      resolver = resolverIn;
      rejecter = rejecterIn;
    });

    const command = `amp dist --noconfig ${esmFlag}`;
    execScriptAsync(command, {
      stdio: 'inherit',
    })
      .on('error', (err) => {
        rejecter(err);
      })
      .on('close', (code) => {
        if (code === 0) {
          log(green('Finished'), cyan(command), green('successfully.'));
          resolver();
        } else {
          log(red('Error occurred while executing'), cyan(command) + red('.'));
          rejecter(new Error(`amp command exited with ${code}`));
        }
      });
    buildPromises.push(deferred);
  });

  try {
    await Promise.all(buildPromises);
  } catch (err) {
    log(red('Error occurred while building AMP runtime:'), err);
    process.exit(1);
  }
  log(green('Finished building all commands'));
}

/**
 * Steps to run during push builds.
 * @return {Promise<void>}
 */
async function pushBuildWorkflow() {
  await buildModuleNomodule();
  timedExecOrDie('amp bundle-size --on_push_build');
}

/**
 * Steps to run during PR builds.
 * @return {Promise<void>}
 */
async function prBuildWorkflow() {
  if (buildTargetsInclude(Targets.RUNTIME)) {
    await buildModuleNomodule();
    timedExecOrDie('amp bundle-size --on_pr_build');
  } else {
    timedExecOrDie('amp bundle-size --on_skipped_build');
    skipDependentJobs(jobName, 'this PR does not affect the runtime');
  }
}

runCiJob(jobName, pushBuildWorkflow, prBuildWorkflow);
