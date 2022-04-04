'use strict';

const fs = require('fs').promises;
const {cyan, green, red} = require('kleur/colors');
const {log} = require('../common/logging');

const DEV_ASSERT_SENTINEL = '__devAssert_sentinel__';
const PURE_ASSERT_SENTINEL = 'Assertion failed';
const UNMINIFIED_JS = './dist/amp.js';
const MINIFIED_JS = './dist/v0.js';

/**
 * Checks that a provided sentinel is/is not contained in a file.
 * @param {string} filePath JS binary to check
 * @param {Record<string, boolean>} sentinels map from sentinels to whether or not
 *                               they should be present
 * @return {Promise<void>}
 * @throws if a sentinel isn't/is present when it should/shouldn't be
 */
async function checkSentinels(filePath, sentinels) {
  const fileContents = await fs.readFile(filePath, 'utf8');

  for (const [sentinel, shouldBePresent] of Object.entries(sentinels)) {
    const isPresent = fileContents.includes(sentinel);

    if (isPresent != shouldBePresent) {
      log(
        red('ERROR:'),
        cyan(filePath),
        shouldBePresent ? 'does not contain' : 'contains',
        `${cyan(sentinel)}.`,
        'Something may be wrong with assertions or compilation.'
      );
      throw new Error('Assertion sentinel check failed');
    }

    log(
      green('SUCCESS:'),
      cyan(sentinel),
      shouldBePresent ? 'found in' : 'not found in',
      cyan(filePath)
    );
  }
}

/**
 * Checks that the file at the provided path does not include devAssert.
 * This works as follows:
 * - The devAssert function includes a sentinel string message behind a
 *   conditional that is always false, but not DCE-able.
 * - In minified code, devAssert should be removed entirely, so the sentinel
 *   will not be present.
 * - In unminified code, it should remain present but never execute.
 * - Even when devAssert is DCE'd, pureAssert still includes the base assertion
 *   logic, so the 'Assertion failed' string will be present.
 * @return {Promise<void>}
 */
async function checkAsserts() {
  await checkSentinels(UNMINIFIED_JS, {
    [PURE_ASSERT_SENTINEL]: true,
    [DEV_ASSERT_SENTINEL]: true,
  });
  await checkSentinels(MINIFIED_JS, {
    [PURE_ASSERT_SENTINEL]: true,
    [DEV_ASSERT_SENTINEL]: false,
  });
}

module.exports = {
  checkAsserts,
};

checkAsserts.description =
  "Check amp.js and v0.js to validate that assertions are DCE'd correctly";
