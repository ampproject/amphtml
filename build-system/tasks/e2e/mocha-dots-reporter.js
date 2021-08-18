
'use strict';

const Mocha = require('mocha');
const {log, logWithoutTimestamp} = require('../../common/logging');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
} = Mocha.Runner.constants;
const {Base} = Mocha.reporters;
const {green, red, yellow} = require('../../common/colors');
const {icon, nbDotsPerLine} =
  require('../../test-configs/karma.conf').superDotsReporter;

/**
 * Custom Mocha reporter for CI builds.
 * Mimics the style of the Karma super-dots reporter.
 * @param {*} runner
 */
class MochaDotsReporter extends Base {
  /**
   * @param {*} runner
   */
  constructor(runner) {
    super(runner);

    let wrapCounter = 0;
    const printDot = (dot) => {
      process.stdout.write(dot);
      if (++wrapCounter >= nbDotsPerLine) {
        wrapCounter = 0;
        process.stdout.write('\n');
      }
    };

    runner
      .once(EVENT_RUN_BEGIN, () => {
        log('Running tests...');
      })
      .on(EVENT_TEST_PASS, () => {
        printDot(green(icon.success));
      })
      .on(EVENT_TEST_FAIL, () => {
        printDot(red(icon.failure));
      })
      .on(EVENT_TEST_PENDING, () => {
        printDot(yellow(icon.ignore));
      })
      .once(EVENT_RUN_END, () => {
        Base.list(this.failures);
        const {failures, passes, pending, tests} = runner.stats;
        logWithoutTimestamp(
          `Executed ${failures + passes} of ${tests}`,
          `(Skipped ${pending})`,
          failures == 0 ? green('SUCCESS') : red(`${failures} FAILED`)
        );
      });
  }
}

module.exports = MochaDotsReporter;
