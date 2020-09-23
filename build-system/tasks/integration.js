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
const fs = require('fs-extra');
const globby = require('globby');
const log = require('fancy-log');
const {
  RuntimeTestRunner,
  RuntimeTestConfig,
} = require('./runtime-test/runtime-test-base');
const {buildRuntime} = require('../common/utils');
const {cyan, green} = require('ansi-colors');
const {maybePrintArgvMessages} = require('./runtime-test/helpers');
const {buildNewServer} = require('../server/typescript-compile');
const pathModule = require('path');

let htmlTransform;

class Runner extends RuntimeTestRunner {
  constructor(config) {
    super(config);
  }

  /** @override */
  async maybeBuild() {
    if (argv.nobuild) {
      return;
    }
    await buildRuntime();
  }
}

async function buildTransformedHtml() {
  const filePaths = await globby('./test/fixtures/**/*.html');
    for (const filePath of filePaths) {
      const normalizedFilePath = pathModule.normalize(filePath);
      if (argv.esm) {
        await transformAndWriteToTestFolder(normalizedFilePath);
      } else {
        await copyToTestFolder(normalizedFilePath);
      }
    }
}

async function copyToTestFolder(filePath) {
  log(
    green('Copying integration test files to'),
    cyan('test-bin/') + green('...')
  );
  await fs.copy(filePath, `./test-bin/${filePath}`);
}

async function transformAndWriteToTestFolder(filePath) {
  try {
    const html = await transform(filePath);
    await fs.write(`./test-bin/${filePath}`, html);
  } catch (e) {
    console./*OK*/ log(
      `${normalizedFilePath} could not be transformed by the postHTML ` +
        `pipeline.\n${e.message}`
    );
  }
}

async function integration() {
  if (argv.esm) {
    buildNewServer();
    htmlTransform = require('../server/new-server/transforms/dist/transform').transform;
  }
  await buildTransformedHtml();

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
  'compiled': '  Runs tests against minified JS',
  'config':
    '  Sets the runtime\'s AMP_CONFIG to one of "prod" (default) or "canary"',
  'coverage': '  Run tests in code coverage mode',
  'debug':
    '  Allow debug statements by auto opening devtools. NOTE: This only ' +
    'works in non headless mode.',
  'edge': '  Runs tests on Edge',
  'firefox': '  Runs tests on Firefox',
  'files': '  Runs tests for specific files',
  'grep': '  Runs tests that match the pattern',
  'headless': '  Run tests in a headless Chrome window',
  'ie': '  Runs tests on IE',
  'nobuild': '  Skips build step',
  'nohelp': '  Silence help messages that are printed prior to test run',
  'report': '  Write test result report to a local file',
  'safari': '  Runs tests on Safari',
  'testnames': '  Lists the name of each test being run',
  'verbose': '  With logging enabled',
  'watch': '  Watches for changes in files, runs corresponding test(s)',
};
