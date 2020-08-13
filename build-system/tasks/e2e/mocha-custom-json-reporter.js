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

function writeOutput(output, filename) {
  try {
    fs.writeFileSync(filename, JSON.stringify(output, null, 4));
    process.stdout.write(
      Base.color(
        'green',
        `Successfully wrote test result report to file '${filename}'`
      )
    );
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
function JsonReporter(runner) {
  Base.call(this, runner);
  const testEvents = [];
  let suiteList = [];

  // We need a fresh array copy every time we enter a new suite,
  // so we can't use push or pop here (because the suiteList info of previous
  // tests in the same suite would be changed)
  runner.on(EVENT_SUITE_BEGIN, function (suite) {
    suiteList = suiteList.concat([suite.title]);
  });

  runner.on(EVENT_SUITE_END, function () {
    suiteList = suiteList.slice(0, -1);
  });

  [EVENT_TEST_PASS, EVENT_TEST_FAIL, EVENT_TEST_PENDING].forEach((event) => {
    runner.on(event, (test) => {
      testEvents.push({test, suiteList, event});
    });
  });

  runner.on(EVENT_RUN_END, function () {
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
    writeOutput({testResults}, `result-reports/e2e.json`);
  });
}

inherits(JsonReporter, Base);
module.exports = JsonReporter;
