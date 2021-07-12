/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const argv = require('minimist')(process.argv.slice(2));
const config = require('../../test-configs/config');
const glob = require('glob');
const {analyticsVendorConfigs} = require('../analytics-vendor-configs');
const {compileJison} = require('../compile-jison');
const {css} = require('../css');
const {exec} = require('child_process');
const {getFilesFromArgv} = require('../../common/utils');
const {green, red} = require('../../common/colors');
const {log} = require('../../common/logging');
const {promisify} = require('util');
const {reportTestStarted} = require('../report-test-status');
const {RuntimeTestRunner} = require('./runtime-test-base');

const execAsync = promisify(exec);

class ParallelTestRunner extends RuntimeTestRunner {
  /**
   * @return {Promise<void>}
   * @override
   */
  async run() {
    await reportTestStarted();
    if (!this.shouldRunInParallel_()) {
      return super.run();
    }
    const numJobs = getNumJobs_();
    const allTestFiles = this.getTestFiles_();
    const jobs = [];
    const testsPerShard = allTestFiles.length / numJobs;
    const startTime = Date.now();
    for (let i = 0; i < numJobs; i++) {
      const startIndex = i * testsPerShard;
      const endIndex = (i + 1) * testsPerShard;
      const files = allTestFiles.slice(startIndex, endIndex);

      log(
        green(`Starting Job ${i}`),
        `with files ${startIndex}-${endIndex} (${files.length}/${allTestFiles.length}) test files`
      );
      jobs.push(
        execAsync(
          `amp unit --headless --worker_id="shard-${i}" --files=${files.join(
            ','
          )}`
        )
      );
    }
    try {
      const allOutput = await Promise.all(jobs);
      const allStdOut = allOutput.reduce(
        (stdout, entry) => (stdout += entry.stdout),
        ''
      );
      const allStdErr = allOutput.reduce(
        (stderr, entry) => (stderr += entry.stderr),
        ''
      );
      log(allStdOut);
      log(allStdErr);
    } catch (err) {
      log(red(err));
      log(red('there was an error running tests'));
    }

    log(green('Ran Tests in'), `${Date.now() - startTime}ms`);
  }

  /** @override */
  async maybeBuild() {
    await analyticsVendorConfigs();
    await css();
    await compileJison();
  }

  /**
   * Get the test files to be run
   * @return {string[]}
   * @private
   */
  getTestFiles_() {
    if (argv.files) {
      return getFilesFromArgv();
    }

    const files = [];
    // DO_NOT_SUBMIT this should be much more intelligent.
    config.unitTestPaths.forEach((path) => {
      glob.sync(path).forEach((file) => files.push(file));
    });

    return files;
  }

  /**
   * @return {boolean}
   * @private
   */
  shouldRunInParallel_() {
    return canBeRunInParallel() && Boolean(this.config.files?.length);
  }
}

/**
 * Can the current test runtime be run in parallel based on the environment variables set.
 * Note that
 * @return {boolean}
 */
function canBeRunInParallel() {
  return !argv.worker_id && getNumJobs_() > 1;
}

/**
 * @return {number}
 */
function getNumJobs_() {
  if (!process.env.JOBS) {
    // return 1;
    // DO_NOT_SUBMIT this is set to enable running CI without effecting other jobs.
    return 2;
  }
  return parseInt(process.env.JOBS, 10);
}

module.exports = {ParallelTestRunner, canBeRunInParallel};
