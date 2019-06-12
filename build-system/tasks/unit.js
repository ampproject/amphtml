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
'using strict';

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
const {getUnitTestsToRun} = require('./runtime-test/helpers-unit');

class Config extends RuntimeTestConfig {
  constructor(testType) {
    super(testType);
  }

  /** @override */
  getFiles() {
    const files = testConfig.commonUnitTestPaths.concat(
      testConfig.chaiAsPromised
    );

    if (argv.files) {
      return files.concat(argv.files);
    }

    if (argv.saucelabs) {
      return files.concat(testConfig.unitTestOnSaucePaths);
    }

    if (argv.local_changes) {
      return files.concat(getUnitTestsToRun(testConfig.unitTestPaths));
    }

    return files.concat(testConfig.unitTestPaths);
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

async function unit() {
  if (
    shouldNotRun() ||
    (argv.local_changes && !getUnitTestsToRun(testConfig.unitTestPaths))
  ) {
    return;
  }

  maybePrintArgvMessages();
  refreshKarmaWdCache();

  const config = new Config('unit');
  const runner = new Runner(config);

  await runner.setup();
  await runner.run();
  await runner.teardown();
}

module.exports = {
  unit,
};

unit.description = 'Runs unit tests';
//TODO(estherkim): fill this out
unit.flags = {
  'local_changes': '',
  'saucelabs': '',
  'chrome_canary': '',
  'chrome_flags': '',
  'coverage': '',
  'firefox': '',
  'files': '',
  'grep': '',
  'headless': '',
  'ie': '',
  'nobuild': '',
  'nohelp': '',
  'safari': '',
  'testnames': '',
  'verbose': '',
  'watch': '',
};
