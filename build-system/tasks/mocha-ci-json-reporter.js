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

const fs = require('fs').promises;
const {
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_RUN_END,
  EVENT_TEST_PENDING,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
} = require('mocha').Runner;
const {Base} = require('mocha').reporters;
const {inherits} = require('mocha').utils;

async function writeOutput(output, filename) {
  try {
    await fs.writeFile(filename, JSON.stringify(output, null, 4));
  } catch (error) {
    process.stdout.write(
      Base.color(
        'fail',
        `Could not write test result report to file '${filename}'`
      )
    );
  }
}

/**
 * Custom Mocha reporter for CI builds.
 * Mimics the structured karma reporter, but for Mocha.
 * @param {*} runner
 */
function ciJsonReporter(runner) {
  Base.call(this, runner);
  const testEvents = [];
  let suiteList = [];

  runner.on(EVENT_SUITE_BEGIN, function (suite) {
    suiteList.push(suite.title);
  });

  runner.on(EVENT_SUITE_END, function () {
    // We need a fresh copy every time we make a new suite,
    // so we can't use pop here (or the suiteList info of previous
    // tests would be changed)
    suiteList = suiteList.slice(0, -1);
  });

  runner.on(EVENT_TEST_PASS, function (test) {
    testEvents.push({test, suiteList, EVENT_TEST_PASS});
  });

  runner.on(EVENT_TEST_FAIL, function (test) {
    testEvents.push({test, suiteList, EVENT_TEST_FAIL});
  });

  runner.on(EVENT_TEST_PENDING, function (test) {
    testEvents.push({test, suiteList, EVENT_TEST_PENDING});
  });

  runner.on(EVENT_RUN_END, async function () {
    const testResults = testEvents.map(({test, suiteList, event}) => ({
      description: test.title,
      suite: suiteList,
      success: event === EVENT_TEST_PASS,
      skipped: event === EVENT_TEST_PENDING,
      time: test.duration, // in milliseconds
    }));

    // Apparently we'll need to add a --no-exit flag when calling this
    // to allow for the asynchronous reporter.
    // See https://github.com/mochajs/mocha/issues/812
    await writeOutput({testResults}, `result-reports/e2e.json`);
  });
}

inherits(ciJsonReporter, Base);
module.exports = ciJsonReporter;
