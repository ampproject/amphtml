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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const testConfig = require('../config');
const {
  maybePrintArgvMessages,
  refreshKarmaWdCache,
  shouldNotRun,
} = require('./runtime-test/helpers');
const {
  RuntimeTestRunner,
  RuntimeTestConfig,
} = require('./runtime-test/runtime-test-base');
const {css} = require('./css');

class Config extends RuntimeTestConfig {
  constructor(testType) {
    super(testType);
  }

  /** @override */
  getFiles() {
    return testConfig.chaiAsPromised.concat(testConfig.a4aTestPaths);
  }
}

class Runner extends RuntimeTestRunner {
  constructor(config) {
    super(config);
  }

  /** @override */
  async maybeBuild() {
    if (argv.nobuild) {
      return;
    }

    await css();
  }
}

async function a4a() {
  if (shouldNotRun()) {
    return;
  }

  maybePrintArgvMessages();
  refreshKarmaWdCache();

  const config = new Config('a4a');
  const runner = new Runner(config);

  await runner.setup();
  await runner.run();
  await runner.teardown();
}

module.exports = {
  a4a,
};
