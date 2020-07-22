/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview This file implements the `gulp report-test-results` task, which [[does something]]
 */

'use strict';

const fetch = require('node-fetch');
const fs = require('fs').promises;
const log = require('fancy-log');
const path = require('path');
const {
  travisBuildNumber,
  travisJobNumber,
  travisCommitSha,
} = require('../common/travis');
const {cyan, green, yellow} = require('ansi-colors');

const REPORTING_API_URL = 'https://amp-test-cases.appspot.com/report';

async function getReport(testType) {
  const report = await fs
    .readFile(`result-reports/${testType}.json`)
    .then(JSON.parse);

  return addJobAndBuildInfo(testType, report);
}

function addJobAndBuildInfo(testType, reportJson) {
  const build = {
    buildNumber: travisBuildNumber(),
    commitSha: travisCommitSha(),
  };

  const job = {
    jobNumber: travisJobNumber(),
    testSuiteType: testType,
  };

  return {build, job, results: reportJson};
}

async function sendTravisKarmaReport(testType) {
  const body = await getReport(testType);

  const response = await fetch(REPORTING_API_URL, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'},
  });

  if (response.ok) {
    log(
      green('INFO:'),
      `Test results of type`,
      cyan(testType),
      'reported to',
      cyan(REPORTING_API_URL)
    );
  } else {
    log(
      yellow('WARNING:'),
      'failed to report results of type',
      cyan(testType),
      ': \n',
      yellow(response.statusText)
    );
  }
}

async function reportTestResults() {
  const filenames = await fs.readdir('result-reports/');
  const testTypes = filenames.map((filename) => path.parse(filename).name);

  await Promise.all(testTypes.map(sendTravisKarmaReport));
}

module.exports = {
  reportTestResults,
};

reportTestResults.description = 'Reports test results to test result database';
