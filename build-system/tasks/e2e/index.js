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
const ciReporter = require('./mocha-ci-reporter');
const config = require('../../test-configs/config');
const glob = require('glob');
const log = require('fancy-log');
const Mocha = require('mocha');
const path = require('path');
const {
  buildRuntime,
  getFilesFromArgv,
  installPackages,
} = require('../../common/utils');
const {cyan} = require('ansi-colors');
const {isTravisBuild} = require('../../common/travis');
const {reportTestStarted} = require('../report-test-status');
const {startServer, stopServer} = require('../serve');
const {watch} = require('gulp');

const HOST = 'localhost';
const PORT = 8000;
const SLOW_TEST_THRESHOLD_MS = 2500;
const TEST_RETRIES = isTravisBuild() ? 2 : 0;

async function launchWebServer_() {
  await startServer(
    {host: HOST, port: PORT},
    {quiet: !argv.debug},
    {compiled: argv.compiled}
  );
}

async function cleanUp_() {
  await stopServer();
}

function createMocha_() {
  const mocha = new Mocha({
    // e2e tests have a different standard for when a test is too slow,
    // so we set a non-default threshold.
    slow: SLOW_TEST_THRESHOLD_MS,
    reporter: argv.testnames || argv.watch ? '' : ciReporter,
    retries: TEST_RETRIES,
    fullStackTrace: true,
  });

  return mocha;
}

async function e2e() {
  // install e2e-specific modules
  installPackages(__dirname);

  // set up promise to return to gulp.task()
  let resolver;
  const deferred = new Promise((resolverIn) => {
    resolver = resolverIn;
  });

  require('@babel/register')({caller: {name: 'test'}});
  const {describes} = require('./helper');
  describes.configure({
    browsers: argv.browsers,
    engine: argv.engine,
    headless: argv.headless,
  });

  // build runtime
  if (!argv.nobuild) {
    await buildRuntime();
  }

  // start up web server
  await launchWebServer_();

  // run tests
  if (!argv.watch) {
    log('Running tests...');
    const mocha = createMocha_();

    // specify tests to run
    if (argv.files) {
      getFilesFromArgv().forEach((file) => {
        delete require.cache[file];
        mocha.addFile(file);
      });
    } else {
      config.e2eTestPaths.forEach((path) => {
        glob.sync(path).forEach((file) => {
          delete require.cache[file];
          mocha.addFile(file);
        });
      });
    }

    await reportTestStarted();
    mocha.run(async (failures) => {
      // end web server
      await cleanUp_();

      // end task
      process.exitCode = failures ? 1 : 0;
      await resolver();
    });
  } else {
    const filesToWatch = argv.files
      ? getFilesFromArgv()
      : [config.e2eTestPaths];
    const watcher = watch(filesToWatch);
    log('Watching', cyan(filesToWatch), 'for changes...');
    watcher.on('change', (file) => {
      log('Detected a change in', cyan(file));
      log('Running tests...');
      // clear file from node require cache if running test again
      delete require.cache[path.resolve(file)];
      const mocha = createMocha_();
      mocha.files = [file];
      mocha.run();
    });
  }

  return deferred;
}

module.exports = {
  e2e,
};

e2e.description = 'Runs e2e tests';
e2e.flags = {
  'browsers':
    '  Run only the specified browser tests. Options are ' +
    '`chrome`, `firefox`, `safari`.',
  'config':
    '  Sets the runtime\'s AMP_CONFIG to one of "prod" (default) or "canary"',
  'core_runtime_only': '  Builds only the core runtime.',
  'nobuild':
    '  Skips building the runtime via `gulp (build|dist) --fortesting`',
  'extensions': '  Builds only the listed extensions.',
  'compiled': '  Runs tests against minified JS',
  'files': '  Run tests found in a specific path (ex: **/test-e2e/*.js)',
  'testnames': '  Lists the name of each test being run',
  'watch': '  Watches for changes in files, runs corresponding test(s)',
  'engine':
    '  The automation engine that orchestrates the browser. ' +
    'Options are `puppeteer` or `selenium`. Default: `selenium`',
  'headless': '  Runs the browser in headless mode',
  'debug': '  Prints debugging information while running tests',
};
