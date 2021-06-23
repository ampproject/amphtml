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
const glob = require('glob');
const path = require('path');
const ciReporter = require('./mocha-ci-reporter');
const dotsReporter = require('./mocha-dots-reporter');
const Mocha = require('mocha');
const {isCiBuild, isCircleciBuild} = require('../../common/ci');
const {getFilesFromArgv, getFilesFromFileList} = require('../../common/utils');

const SLOW_TEST_THRESHOLD_MS = 2500;
const TEST_RETRIES = isCiBuild() ? 2 : 0;

/**
 * Creates a mocha test instance with configuration determined by CLI args.
 * @return {!Mocha}
 */
function createMocha_() {
  let reporter;
  if (argv.testnames || argv.watch) {
    reporter = '';
  } else if (argv.report || isCircleciBuild()) {
    // TODO(#28387) clean up this typing.
    reporter = /** @type {*} */ (ciReporter);
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
    reporterOptions: isCiBuild()
      ? {
          mochaFile: 'result-reports/e2e.xml',
        }
      : null,
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

function getDefaultMochaFiles() {
  /** @type {string[]} */
  const files = [];  if (argv.files || argv.filelist) {
  if (argv.files) {
    getFilesFromArgv().forEach(file => files.push(file));
    getFilesFromFileList().forEach(file => files.push(file));
  } else {
    config.e2eTestPaths.forEach((path) => {
      glob.sync(path).forEach(file => files.push(file));
    });
  }

  return files;
}

/**
 * @return {!Mocha}
 */
function createMochaWithFiles(files = getDefaultMochaFiles()) {
  const mocha = createMocha_();
  const addFile = addMochaFile_.bind(null, mocha);
  files.forEach(addFile);

  return mocha;
}

module.exports = {
  createMochaWithFiles,
  getDefaultMochaFiles,
};
