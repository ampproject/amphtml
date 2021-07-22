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

const {createMochaWithFiles} = require('./mocha-utils');
const {cyan, green, red} = require('../../common/colors');
const {describes} = require('./helper');
const {log} = require('../../common/logging');
const {parentPort, workerData} = require('worker_threads');
require('@babel/register')({caller: {name: 'test'}});

/**
 * @typedef {{
 *   startTime: number,
 *   endTime: number,
 *   passed: boolean,
 * }}
 */
let TestResultInfoDef;

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
 * @param {() => T} fn
 * @return {Promise<T>}
 * @template T
 */
async function stifleOutput(fn) {
  // Stifling Test Output to avoid cluttering logs.
  const stdoutWrite = process.stdout._write;
  const stderrWrite = process.stderr._write;
  const writeStub = (_chunk, _encoding, cb) => cb();
  process.stdout._write = writeStub;
  process.stderr._write = writeStub;

  const result = await fn();

  process.stdout._write = stdoutWrite;
  process.stderr._write = stderrWrite;

  return result;
}

/**
 * @return {Promise<Record<string, TestResultInfoDef>>}
 */
async function runEffectedTests() {
  const {testFilesRequiringValidation} = workerData;
  const mocha = createMochaWithFiles(testFilesRequiringValidation);

  return new Promise((resolve) => {
    /** @type {Record<string, Partial<TestResultInfoDef>>} */
    const results = {};
    mocha
      .run()
      .on('test', function (test) {
        results[test.title] = {
          startTime: Date.now(),
        };
      })
      .on('pass', (test) => {
        const title = getBaseTestName_(test.title);
        if (!results[title]) {
          results[title] = {};
        }
        results[title].passed = true;
        results[title].endTime = Date.now();
      })
      .on('fail', (test) => {
        const title = getBaseTestName_(test.title);
        if (!results[title]) {
          results[title] = {};
        }
        results[title].passed = false;
        results[title].endTime = Date.now();
      })
      .on('end', () => {
        resolve(/** @type {Record<string, TestResultInfoDef>} */ (results));
      });
  });
}

/**
 * Send message to the parent job.
 * @param {*} message
 * @param {boolean=} complete
 */
function postMessage(message, complete = false) {
  parentPort?./* OK */ postMessage({message, complete});
}

/**
 * Runs effected tests and outputs their results.
 * @return {Promise<void>}
 */
async function runValidation_() {
  const {describesConfiguration, runId} = workerData;
  describes.configure(describesConfiguration);
  log('Beginning', cyan(`Run ${runId}`));
  const result = await stifleOutput(runEffectedTests);
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
    cyan(`Run ${runId}`),
    'there where',
    red(`${aggregates.fail} tests failed`),
    'and',
    green(`${aggregates.pass} tests passed`)
  );
  postMessage(JSON.stringify(result), true);
}

if (require.main === module) {
  runValidation_();
}
