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
 * See the License for the specific lan``guage governing permissions and
 * limitations under the License.
 */

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const ciReporter = require('./mocha-ci-reporter');
const config = require('../../test-configs/config');
const dotsReporter = require('./mocha-dots-reporter');
const fs = require('fs');
const glob = require('glob');
const http = require('http');
const log = require('fancy-log');
const Mocha = require('mocha');
const path = require('path');
const {
  buildRuntime,
  getFilesFromArgv,
  installPackages,
} = require('../../common/utils');
const {cyan} = require('ansi-colors');
const {execOrDie} = require('../../common/exec');
const {HOST, PORT, startServer, stopServer} = require('../serve');
const {isCiBuild} = require('../../common/ci');
const {maybePrintCoverageMessage} = require('../helpers');
const {reportTestStarted} = require('../report-test-status');
const {watch} = require('gulp');

const SLOW_TEST_THRESHOLD_MS = 2500;
const TEST_RETRIES = isCiBuild() ? 2 : 0;

const COV_DOWNLOAD_PATH = '/coverage/download';
const COV_OUTPUT_DIR = './test/coverage-e2e';
const COV_OUTPUT_HTML = path.resolve(COV_OUTPUT_DIR, 'lcov-report/index.html');

/**
 * Set up the e2e testing environment.
 * @return {!Promise}
 */
async function setUpTesting_() {
  // install e2e-specific modules
  installPackages(__dirname);

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
  return startServer(
    {host: HOST, port: PORT},
    {quiet: !argv.debug},
    {compiled: argv.compiled}
  );
}

/**
 * Creates a mocha test instance with configuration determined by CLI args.
 * @return {!Mocha}
 */
function createMocha_() {
  let reporter;
  if (argv.testnames || argv.watch) {
    reporter = '';
  } else if (argv.report) {
    reporter = ciReporter;
  } else {
    reporter = dotsReporter;
  }

  return new Mocha({
    // e2e tests have a different standard for when a test is too slow,
    // so we set a non-default threshold.
    slow: SLOW_TEST_THRESHOLD_MS,
    reporter,
    retries: TEST_RETRIES,
    fullStackTrace: true,
  });
}

/**
 * Refreshes require cache and adds file to a Mocha instance.
 * @param {!Mocha} mocha Mocha test instance.
 * @param {string} file relative path to test file to add.
 */
function addMochaFile_(mocha, file) {
  delete require.cache[path.resolve(file)];
  mocha.addFile(file);
}

/**
 * Fetch aggregated coverage data from server.
 * @param {string} outDir relative path to coverage files directory.
 */
async function fetchCoverage_(outDir) {
  // Note: We could access the coverage UI directly through the server started
  // for the e2e tests, but then that coverage data would vanish once that
  // server instance was closed. This method will persist the coverage data so
  // it can be accessed separately.

  // Clear out previous coverage data.
  fs.rmdirSync(outDir, {recursive: true});
  fs.mkdirSync(outDir);

  const zipFilename = path.join(outDir, 'coverage.zip');
  const zipFile = fs.createWriteStream(zipFilename);
  await new Promise((resolve, reject) => {
    http
      .get(
        {
          host: HOST,
          port: PORT,
          path: COV_DOWNLOAD_PATH,
        },
        (response) => {
          response.pipe(zipFile);
          zipFile.on('finish', () => zipFile.close(resolve));
        }
      )
      .on('error', (err) => {
        fs.unlinkSync(zipFilename);
        reject(err);
      });
  });
  execOrDie(`unzip -o ${zipFilename} -d ${outDir}`);
}

/**
 * Runs e2e tests on all files under test.
 * @return {!Promise}
 */
async function runTests_() {
  const mocha = createMocha_();
  const addFile = addMochaFile_.bind(null, mocha);

  // specify tests to run
  if (argv.files) {
    getFilesFromArgv().forEach(addFile);
  } else {
    config.e2eTestPaths.forEach((path) => {
      glob.sync(path).forEach(addFile);
    });
  }

  await reportTestStarted();

  // return promise to gulp that resolves when there's an error.
  return new Promise((resolve) => {
    mocha.run(async (failures) => {
      if (argv.coverage) {
        await fetchCoverage_(COV_OUTPUT_DIR);
        maybePrintCoverageMessage(COV_OUTPUT_HTML);
      }
      await stopServer();
      process.exitCode = failures ? 1 : 0;
      resolve();
    });
  });
}

/**
 * Watches files a under test, running affected e2e tests on changes.
 * @return {!Promise}
 */
async function runWatch_() {
  const filesToWatch = argv.files ? getFilesFromArgv() : config.e2eTestPaths;

  log('Watching', cyan(filesToWatch), 'for changes...');
  watch(filesToWatch).on('change', (file) => {
    log('Detected a change in', cyan(file));
    const mocha = createMocha_();
    addMochaFile_(mocha, file);
    mocha.run();
  });

  // return non-resolving promise to gulp.
  return new Promise(() => {});
}

/**
 * Entry-point to run e2e tests.
 * @return {!Promise}
 */
async function e2e() {
  await setUpTesting_();
  return argv.watch ? runWatch_() : runTests_();
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
  'report': '  Write test result report to a local file',
  'coverage': '  Collect coverage data from instrumented code',
};
