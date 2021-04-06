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

const fs = require('fs').promises;
const {cyan, red, green} = require('kleur/colors');
const {log} = require('../common/logging');

const DEV_ASSERT_SENTINEL = '__devAssert_sentinel__';
const PURE_ASSERT_SENTINEL = 'Assertion failed';
const UNMINIFIED_JS = './dist/amp.js';
const MINIFIED_JS = './dist/v0.js';

/**
 * Checks that a provided sentinel is/is not contained in a file.
 * @param {string} filePath JS binary to check
 * @param {Map<string, boolean>} sentinels map from sentinels to whether or not
 *                               they should be present
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
  "Checks amp.js and v0.js to validate that assertions are DCE'd correctly";
