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

const Mocha = require('mocha');
const path = require('path');
const TEST_SUITE_PATH = 'build-system/tasks/performance/test-suite.js';

function runTests(resolver) {
  const mocha = new Mocha();
  mocha.addFile(path.join('./', TEST_SUITE_PATH));
  mocha.run(async (failures) => {
    process.exitCode = failures ? 1 : 0;
    await resolver();
  });
}

module.exports = runTests;
