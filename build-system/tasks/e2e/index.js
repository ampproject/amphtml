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
const config = require('../../test-configs/config');
const fs = require('fs');
const http = require('http');
const path = require('path');
const {
  buildRuntime,
  getFilesFromArgv,
  getFilesFromFileList,
} = require('../../common/utils');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../../common/ctrlcHandler');
const {createMochaWithFiles} = require('./mocha-utils');
const {cyan} = require('../../common/colors');
const {execOrDie} = require('../../common/exec');
const {HOST, PORT, startServer, stopServer} = require('../serve');
const {log} = require('../../common/logging');
const {maybePrintCoverageMessage} = require('../helpers');
const {validateTests} = require('./validate-tests');
const {watch} = require('chokidar');

const COV_DOWNLOAD_PATH = '/coverage/download';
const COV_OUTPUT_DIR = './test/coverage-e2e';
const COV_OUTPUT_HTML = path.resolve(COV_OUTPUT_DIR, 'lcov-report/index.html');

/**
 * Set up the e2e testing environment.
 * @return {!Promise<void>}
 */
async function setUpTesting_() {
  require('@babel/register')({caller: {name: 'test'}});
  const {describes} = require('./helper');
  describes.configure({
    browsers: argv.browsers,
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
 * Fetch aggregated coverage data from server.
 * @param {string} outDir relative path to coverage files directory.
 * @return {Promise<void>}
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

  await /** @type {Promise<void>} */ (
    new Promise((resolve, reject) => {
      http
        .get(
          {
            host: HOST,
            port: PORT,
            path: COV_DOWNLOAD_PATH,
          },
          (response) => {
            response.pipe(zipFile);
            zipFile.on('finish', () => {
              zipFile.close();
              resolve();
            });
          }
        )
        .on('error', (err) => {
          fs.unlinkSync(zipFilename);
          reject(err);
        });
    })
  );
  execOrDie(`unzip -o ${zipFilename} -d ${outDir}`);
}

/**
 * Runs e2e tests on all files under test.
 * @return {!Promise<void>}
 */
async function runTests_() {
  const mocha = createMochaWithFiles();

  if (argv.validate) {
    await validateTests();
    process.exit(0);
  }

  // return promise to amp that resolves when there's an error.
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
 * @return {!Promise<void>}
 */
async function runWatch_() {
  const filesToWatch =
    argv.files || argv.filelist
      ? getFilesFromArgv().concat(getFilesFromFileList())
      : config.e2eTestPaths;

  log('Watching', cyan(filesToWatch), 'for changes...');
  watch(filesToWatch).on('change', (file) => {
    log('Detected a change in', cyan(file));
    const mocha = createMochaWithFiles([file]);
    mocha.run();
  });

  // return non-resolving promise to amp.
  return new Promise(() => {});
}

/**
 * Entry-point to run e2e tests.
 * @return {Promise<void>}
 */
async function e2e() {
  const handlerProcess = createCtrlcHandler('e2e');
  await setUpTesting_();
  argv.watch ? await runWatch_() : await runTests_();
  exitCtrlcHandler(handlerProcess);
}

module.exports = {
  e2e,
};

e2e.description = 'Run e2e tests';
e2e.flags = {
  'browsers':
    'Run tests on the specified browser (options are `chrome`, `firefox`, `safari`)',
  'config':
    'Set the runtime\'s AMP_CONFIG to one of "prod" (default) or "canary"',
  'core_runtime_only': 'Build only the core runtime.',
  'nobuild': 'Skip building the runtime via `amp (build|dist) --fortesting`',
  'define_experiment_constant':
    'Transform tests with the EXPERIMENT constant set to true',
  'experiment': 'Experiment being tested (used for status reporting)',
  'extensions': 'Build only the listed extensions.',
  'compiled': 'Run tests against minified JS',
  'files': 'Run tests found in a specific path (ex: **/test-e2e/*.js)',
  'testnames': 'List the name of each test being run',
  'watch': 'Watch for changes in files, runs corresponding test(s)',
  'headless': 'Run the browser in headless mode',
  'debug': 'Print debugging information while running tests',
  'report': 'Write test result report to a local file',
  'coverage': 'Collect coverage data from instrumented code',
  'filelist': 'Run tests specified in this comma-separated list of test files',
  'validate': 'Validate the runtime and flakiness of newly added/updated tests',
};
