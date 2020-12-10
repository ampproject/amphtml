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
const {
  ciCommitSha,
  ciPullRequestSha,
  isCiBuild,
  isPullRequestBuild,
} = require('../common/ci');
const {getStdout} = require('../common/exec');
const {shortSha} = require('../common/git');

const {green, yellow, cyan} = colors;
const CODECOV_EXEC = './node_modules/.bin/codecov';
const COVERAGE_REPORTS = {
  'unit_tests': 'test/coverage/lcov-unit.info',
  'integration_tests': 'test/coverage/lcov-integration.info',
  'e2e_tests': 'test/coverage-e2e/lcov.info',
};

/**
 * Uploads a single report
 * @param {string} file
 * @param {string} flags
 */
function uploadReport(file, flags) {
  const codecovCmd = `${CODECOV_EXEC} --file=${file} --flags=${flags}`;
  const output = getStdout(codecovCmd);
  const viewReportPrefix = 'View report at: ';
  const viewReport = output.match(`${viewReportPrefix}.*`);
  if (viewReport && viewReport.length > 0) {
    log(green('INFO:'), 'Uploaded', cyan(file));
  } else {
    log(
      yellow('WARNING:'),
      'Code coverage report upload may have failed:\n',
      yellow(output)
    );
  }
}

/**
 * Uploads code coverage reports for unit / integration tests during CI builds.
 */
async function codecovUpload() {
  if (!isCiBuild()) {
    log(
      yellow('WARNING:'),
      'Code coverage reports can only be uploaded by CI builds.'
    );
    return;
  }

  const commitSha = shortSha(
    isPullRequestBuild() ? ciPullRequestSha() : ciCommitSha()
  );
  log(
    green('INFO:'),
    'Uploading coverage reports to',
    cyan(`https://codecov.io/gh/ampproject/amphtml/commit/${commitSha}`)
  );

  Object.entries(COVERAGE_REPORTS)
    .filter(([, reportFile]) => fs.existsSync(reportFile))
    .forEach(([testType, reportFile]) => uploadReport(reportFile, testType));
}

module.exports = {
  codecovUpload,
};

codecovUpload.description =
  'Uploads code coverage reports to codecov.io during CI builds.';
