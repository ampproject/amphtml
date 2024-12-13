'use strict';

const fs = require('fs-extra');
const mocha = require('mocha');
const {Base} = require('mocha').reporters;
const {inherits} = require('mocha').utils;

const {
  EVENT_RUN_END,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
} = mocha.Runner.constants;
/**
 * @param {object} output
 * @param {string} filename
 * @return {Promise<void>}
 */
async function writeOutput(output, filename) {
  try {
    await fs.outputJson(filename, output, {spaces: 4});
  } catch (error) {
    process.stdout.write(
      Base.color(
        'fail',
        `Could not write test result report to file '${filename}': ${error}`
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
  // @ts-ignore
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

  [EVENT_TEST_PASS, EVENT_TEST_FAIL, EVENT_TEST_PENDING].forEach((event) => {
    runner.on(event, (test) => {
      testEvents.push({test, suiteList, event});
    });
  });

  runner.on(EVENT_RUN_END, async function () {
    const results = testEvents.map(({event, suiteList, test}) => ({
      description: test.title,
      suite: suiteList,
      success: event === EVENT_TEST_PASS,
      skipped: event === EVENT_TEST_PENDING,
      time: test.duration, // in milliseconds
    }));

    // Apparently we'll need to add a --no-exit flag when calling this
    // to allow for the asynchronous reporter.
    // See https://github.com/mochajs/mocha/issues/812
    await writeOutput({browsers: [{results}]}, `result-reports/e2e.json`);
  });
}

inherits(JsonReporter, Base);
module.exports = JsonReporter;
