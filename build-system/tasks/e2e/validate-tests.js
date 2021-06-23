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
 * See the License for the specific lan``guage governing permissions and
 * limitations under the License.
 */

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {cyan, red, green} = require('../../common/colors');
const {gitDiffNameOnlyMain} = require('../../common/git');
const {isCiBuild} = require('../../common/ci');
const {log} = require('../../common/logging');
const {createMochaWithFiles, getDefaultMochaFiles} = require('./mocha-utils');
const {getFilesFromArgv} = require('../../common/utils');

/**
 * @typedef {{
 *   startTime: number,
 *   endTime: number,
 *   passed: boolean,
 * }}
 */
let TestResultDef;

/**
 * Strip information about test hooks from a test name.
 * i.e. '"before each" hook for "Should call amp-img layoutCallback"'
 * becomes 'Should call amp-img layoutCallback'
 * @param {string} testName
 * @return {string}
 */
function getBaseTestName_(testName) {
  const chunks = testName.replace(/"/g, '').split(' hook for ');
  return chunks[chunks.length - 1];
}

/**
 * Get the maximum allowed average runtime of a test.
 * @return {number}
 */
function getMaxAllowedTestTime_() {
  return process.env.MAX_TEST_TIME
    ? parseInt(process.env.MAX_TEST_TIME, 10)
    : 1000;
}

/**
 * Get the number of times that a test should be run.
 * @return {number}
 */
function getTestValidatorIterations_() {
  return process.env.TEST_VALIDATOR_ITERATIONS
    ? parseInt(process.env.TEST_VALIDATOR_ITERATIONS, 10)
    : 10;
}

/**
 * Get the minimum allowable pass percentage.
 * @return {number}
 */
function getMinTestPassPercentage_() {
  return (
    (process.env.TEST_VALIDATOR_MIN_PASS_PERCENTAGE
      ? parseInt(process.env.TEST_VALIDATOR_MIN_PASS_PERCENTAGE, 10)
      : 95) / 100
  );
}

/**
 * Get the modified test files which require validation.
 * This can be manually overridden with the command line argument `files` to
 * validate arbitrary files.
 * @return {string[]}
 */
function getTestsFilesToValidate() {
  if (argv.files) {
    return getFilesFromArgv();
  }
  const changedFiles = gitDiffNameOnlyMain();
  const testFilesRequiringValidation = getDefaultMochaFiles().filter((file) =>
    changedFiles.includes(file)
  );

  return testFilesRequiringValidation;
}

/**
 * @param {Record<string, TestResultDef>[]} results
 * @return {Record<string, number>}
 */
function computeAverageTestRuntimes(results) {
  // Computing runtimes by test.
  const totalTestRuntimes = results.reduce((testTimes, result) => {
    Object.entries(result).forEach(([testName, testInfo]) => {
      if (!testTimes[testName]) {
        testTimes[testName] = 0;
      }
      testTimes[testName] += testInfo.endTime - testInfo.startTime;

      return testTimes;
    }, {});
    return testTimes;
  }, /** @type {Record<string, number>} */ ({}));

  return Object.entries(totalTestRuntimes).reduce(
    (averageRuntimes, [testName, totalRuntime]) => {
      averageRuntimes[testName] = (totalRuntime / results.length).toFixed(2);
      return averageRuntimes;
    },
    {}
  );
}

/**
 * @param {Record<string, TestResultDef>[]} results
 * @return {Record<string, number>}
 */
function computeTestFlakiness(results) {
  const testPassCounts = results.reduce((nameToPassCount, result) => {
    Object.entries(result).forEach(([testName, testInfo]) => {
      if (!nameToPassCount[testName]) {
        nameToPassCount[testName] = 0;
      }
      nameToPassCount[testName] += testInfo.passed ? 1 : 0;
    });

    return nameToPassCount;
  }, /** @type {Record<string, number>} */ ({}));
  return Object.entries(testPassCounts).reduce(
    (testPassPercentages, [testName, passCount]) => {
      testPassPercentages[testName] = (passCount / results.length).toFixed(4);
      return testPassPercentages;
    },
    {}
  );
}

/**
 * Runs the e2e tests in modified files additional times to validate runtime and
 * flakiness complaince.
 * @return {Promise<void>}
 */
async function validateTestsIfNecessary() {
  return new Promise(async (resolve) => {
    if (!isCiBuild() && !argv.validate) {
      resolve();
      return;
    }

    // specify tests to run
    const testFilesRequiringValidation = getTestsFilesToValidate();

    if (!testFilesRequiringValidation.length) {
      log(green('No Tests Require Validation'));
      resolve();
      return;
    }

    /** @type {Record<string, TestResultDef>[]} */
    const results = [];
    const iterations = getTestValidatorIterations_();
    for (let i = 0; i < iterations; i++) {
      log('Beginning', cyan(`Run ${i}`), 'complete');
      const result = await runEffectedTests();
      results.push(result);
      const aggregates = Object.values(result).reduce(
        (aggregate, value) => {
          if (value.passed) {
            aggregate.pass++;
          } else {
            aggregate.fail++;
          }

          return aggregate;
        },
        {pass: 0, fail: 0}
      );
      log(
        'During',
        cyan(`Run ${i}`),
        'there where',
        red(`${aggregates.fail} tests failed`),
        'and',
        green(`${aggregates.pass} tests passed`)
      );
    }

    log('Average Test Runtimes:');
    const testRuntimes = computeAverageTestRuntimes(results);
    const maxAllowedRuntime = getMaxAllowedTestTime_();
    Object.entries(testRuntimes).forEach(([testName, averageTime]) => {
      const color = averageTime > maxAllowedRuntime ? red : green;
      log(color(testName), `${averageTime}ms`);
    });
    const slowTests = Object.entries(testRuntimes).filter(
      ([, runtime]) => runtime > maxAllowedRuntime
    );
    if (slowTests.length > 0) {
      const testOrTests = `test${slowTests.length > 1 ? 's' : ''}`;
      log(`The following ${testOrTests} exceeded the max runtime`);
      slowTests.forEach(([testName, runtime]) => {
        log(red(testName), ':', `${runtime}ms`);
      });
    }

    const minPassPercentage = getMinTestPassPercentage_();
    const flakyTests = Object.entries(computeTestFlakiness(results)).filter(
      ([, passPercentage]) => passPercentage < minPassPercentage
    );
    if (flakyTests.length > 0) {
      const testOrTests = `test${flakyTests.length > 1 ? 's' : ''}`;
      log(
        `The following ${testOrTests} failed to meet the flakiness threshold of ${minPassPercentage}%`
      );
      flakyTests.forEach(([testName, passPercentage]) => {
        log(red(testName), ':', red(`${passPercentage}%`));
      });
    }

    /**
     * @return {Promise<Record<string, TestResultDef>>}
     */
    async function runEffectedTests() {
      const mocha = createMochaWithFiles(testFilesRequiringValidation);

      return new Promise((resolve) => {
        /** @type {Record<string, Partial<TestResultDef>>} */
        const results = {};
        mocha
          .run()
          .on('test', (test) => {
            log('Running', test.title);
            results[test.title] = {
              startTime: Date.now(),
            };
          })
          .on('pass', (test) => {
            const title = getBaseTestName_(test.title);
            log(title, 'passed');
            if (!results[title]) {
              results[title] = {};
            }
            results[title].passed = true;
            results[title].endTime = Date.now();
          })
          .on('fail', (test) => {
            const title = getBaseTestName_(test.title);
            log(title, 'failed');
            if (!results[title]) {
              results[title] = {};
            }
            results[title].passed = false;
            results[title].endTime = Date.now();
          })
          .on('end', () => {
            resolve(/** @type {Record<string, TestResultDef>} */ (results));
          });
      });
    }
  });
}

module.exports = {
  validateTestsIfNecessary,
};
