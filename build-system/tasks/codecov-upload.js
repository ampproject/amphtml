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

const colors = require('ansi-colors');
const fs = require('fs-extra');
const log = require('fancy-log');
const {getStdout} = require('../exec');
const {isTravisBuild} = require('../travis');

const {green, yellow, cyan} = colors;

/**
 * Uploads a single report
 * @param {string} file
 * @param {string} flags
 */
function uploadReport(file, flags) {
  const codecovExecutable = './node_modules/.bin/codecov';
  const codecovCmd = `${codecovExecutable} --file=${file} --flags=${flags}`;
  const output = getStdout(codecovCmd);
  const viewReportPrefix = 'View report at: ';
  const viewReport = output.match(`${viewReportPrefix}.*`);
  if (viewReport && viewReport.length > 0) {
    log(
      green('INFO:'),
      'Uploaded',
      cyan(file),
      'to',
      cyan(viewReport[0].replace(viewReportPrefix, ''))
    );
  } else {
    log(
      yellow('WARNING:'),
      'Code coverage report upload may have failed:\n',
      yellow(output)
    );
  }
}

/**
 * Uploads code coverage reports for unit and integration tests during Travis
 * jobs.
 */
async function codecovUpload() {
  if (!isTravisBuild()) {
    log(
      yellow('WARNING:'),
      'Code coverage reports can only be uploaded by Travis builds.'
    );
    return;
  }
  log(
    green('INFO:'),
    'Uploading coverage reports to',
    cyan('https://codecov.io/gh/ampproject/amphtml')
  );
  const unitTestsReport = 'test/coverage/lcov-unit.info';
  const integrationTestsReport = 'test/coverage/lcov-integration.info';
  if (fs.existsSync(unitTestsReport)) {
    uploadReport(unitTestsReport, 'unit_tests');
  }
  if (fs.existsSync(integrationTestsReport)) {
    uploadReport(integrationTestsReport, 'integration_tests');
  }
}

module.exports = {
  codecovUpload,
};

codecovUpload.description =
  'Uploads code coverage reports to codecov.io during Travis builds.';
