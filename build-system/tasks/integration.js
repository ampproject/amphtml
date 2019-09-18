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
const {
  maybePrintArgvMessages,
  shouldNotRun,
} = require('./runtime-test/helpers');
const {
  RuntimeTestRunner,
  RuntimeTestConfig,
} = require('./runtime-test/runtime-test-base');
const {execOrDie} = require('../exec');

class Runner extends RuntimeTestRunner {
  constructor(config) {
    super(config);
  }

  /** @override */
  async maybeBuild() {
    if (argv.nobuild) {
      return;
    }
    execOrDie('gulp clean');
    execOrDie(`gulp dist --fortesting --config ${argv.config}`);
  }
}

async function integration() {
  if (shouldNotRun()) {
    return;
  }

  maybePrintArgvMessages();

  const config = new RuntimeTestConfig('integration');
  const runner = new Runner(config);

  await runner.setup();
  await runner.run();
  await runner.teardown();
}

module.exports = {
  integration,
};

integration.description = 'Runs integration tests';
integration.flags = {
  'chrome_canary': '  Runs tests on Chrome Canary',
  'chrome_flags': '  Uses the given flags to launch Chrome',
  'compiled':
    '  Changes integration tests to use production JS binaries for execution',
  'config':
    '  Sets the runtime\'s AMP_CONFIG to one of "prod" (default) or "canary"',
  'coverage': '  Run tests in code coverage mode',
  'firefox': '  Runs tests on Firefox',
  'files': '  Runs tests for specific files',
  'grep': '  Runs tests that match the pattern',
  'headless': '  Run tests in a headless Chrome window',
  'ie': '  Runs tests on IE',
  'nobuild': '  Skips build step',
  'nohelp': '  Silence help messages that are printed prior to test run',
  'safari': '  Runs tests on Safari',
  'saucelabs': '  Runs tests on saucelabs (requires setup)',
  'testnames': '  Lists the name of each test being run',
  'verbose': '  With logging enabled',
  'watch': '  Watches for changes in files, runs corresponding test(s)',
};
