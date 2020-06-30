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

const fetch = require('node-fetch');
const fs = require('fs').promises;
const log = require('fancy-log');
const {
  travisBuildNumber,
  travisJobNumber,
  travisCommitSha,
} = require('../../common/travis');

const JSON_REPORT_TEST_TYPES = new Set(['unit', 'integration']);
const REPORTING_API_URL = 'https://amp-test-cases.appspot.com/report';

function resultFilename(testType) {
  return `results_${testType}.json`;
}

async function getReport(testType) {
  const karmaReportString = await fs.readFile(resultFilename(testType));
  const karmaReportJson = JSON.parse(karmaReportString);

  const travisReport = addJobAndBuildInfo(testType, karmaReportJson);

  return travisReport;
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
    log(`Test results of type ${testType} reported to ${REPORTING_API_URL}`);
  } else {
    log(`Error reporting results of type ${testType}: ${response.statusText}`);
  }
}

function isReportTestType(testType) {
  return JSON_REPORT_TEST_TYPES.has(testType);
}

function shouldPostReport(config) {
  return config.reporters.includes('json-result');
}

module.exports = {
  isReportTestType,
  shouldPostReport,
  sendTravisKarmaReport,
  resultFilename,
};
