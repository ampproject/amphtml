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
const requestPromise = require('request-promise');
const {
  isCircleciBuild,
  isPullRequestBuild,
  isGithubActionsBuild,
} = require('../common/ci');
const {ciJobUrl} = require('../common/ci');
const {cyan, yellow} = require('kleur/colors');
const {determineBuildTargets, Targets} = require('../pr-check/build-targets');
const {getValidExperiments} = require('../common/utils');
const {gitCommitHash} = require('../common/git');
const {log} = require('../common/logging');

const reportBaseUrl = 'https://amp-test-status-bot.appspot.com/v0/tests';

const IS_AMP_INTEGRATION = argv._[0] === 'integration';
const IS_AMP_UNIT = argv._[0] === 'unit';
const IS_AMP_E2E = argv._[0] === 'e2e';

const TEST_TYPE_SUBTYPES = isGithubActionsBuild()
  ? new Map([
      ['integration', ['firefox', 'safari', 'edge', 'ie']],
      ['unit', ['firefox', 'safari', 'edge']],
      ['e2e', ['firefox', 'safari']],
    ])
  : isCircleciBuild()
  ? new Map([
      [
        'integration',
        [
          'unminified',
          'nomodule-prod',
          'nomodule-canary',
          'module-prod',
          'module-canary',
          ...getValidExperiments(),
        ],
      ],
      ['unit', ['unminified', 'local-changes']],
      ['e2e', ['nomodule', ...getValidExperiments()]],
    ])
  : new Map([]);
const TEST_TYPE_BUILD_TARGETS = new Map([
  ['integration', [Targets.RUNTIME, Targets.INTEGRATION_TEST]],
  ['unit', [Targets.RUNTIME, Targets.UNIT_TEST]],
  ['e2e', [Targets.RUNTIME, Targets.E2E_TEST]],
]);

/**
 * @return {string}
 */
function inferTestType() {
  // Determine type (early exit if there's no match).
  const type = IS_AMP_E2E
    ? 'e2e'
    : IS_AMP_INTEGRATION
    ? 'integration'
    : IS_AMP_UNIT
    ? 'unit'
    : null;
  if (type == null) {
    throw new Error('No valid test type was inferred');
  }

  // Determine subtype (more specific cases come first).
  const subtype = argv.local_changes
    ? 'local-changes'
    : argv.esm
    ? 'module'
    : argv.firefox
    ? 'firefox'
    : argv.safari
    ? 'safari'
    : argv.edge
    ? 'edge'
    : argv.ie
    ? 'ie'
    : argv.browsers == 'safari'
    ? 'safari'
    : argv.browsers == 'firefox'
    ? 'firefox'
    : argv.experiment
    ? argv.experiment
    : argv.compiled
    ? 'nomodule'
    : 'unminified';

  return `${type}/${subtype}${maybeAddConfigSubtype()}`;
}

/**
 * @return {string}
 */
function maybeAddConfigSubtype() {
  if (isCircleciBuild() && argv.config) {
    return `-${argv.config}`;
  }
  return '';
}

/**
 * @param {string} type
 * @param {string} action
 * @return {Promise<void>}
 */
async function postReport(type, action) {
  if (type && isPullRequestBuild()) {
    const commitHash = gitCommitHash();

    try {
      const body = await requestPromise({
        method: 'POST',
        uri: `${reportBaseUrl}/${commitHash}/${type}/${action}`,
        body: JSON.stringify({
          ciJobUrl: ciJobUrl(),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        // Do not use `json: true` because the response is a string, not JSON.
      });

      log('Reported', cyan(`${type}/${action}`), 'to GitHub');
      if (body.length > 0) {
        log('Response was', cyan(body.substr(0, 100)));
      }
    } catch (error) {
      log(
        yellow('WARNING:'),
        'failed to report',
        cyan(`${type}/${action}`),
        'to GitHub:\n',
        error.message.substr(0, 100)
      );
    }
  }
}

/**
 * @return {Promise<void>}
 */
async function reportTestErrored() {
  await postReport(inferTestType(), 'report/errored');
}

/**
 * @param {number|string} success
 * @param {number|string} failed
 * @return {Promise<void>}
 */
async function reportTestFinished(success, failed) {
  await postReport(inferTestType(), `report/${success}/${failed}`);
}

/**
 * @return {Promise<void>}
 */
async function reportTestSkipped() {
  await postReport(inferTestType(), 'skipped');
}

/**
 * @return {Promise<void>}
 */
async function reportTestStarted() {
  await postReport(inferTestType(), 'started');
}

/**
 * @return {Promise<void>}
 */
async function reportAllExpectedTests() {
  const buildTargets = determineBuildTargets();
  for (const [type, subTypes] of TEST_TYPE_SUBTYPES) {
    const testTypeBuildTargets = TEST_TYPE_BUILD_TARGETS.get(type);
    if (testTypeBuildTargets === undefined) {
      throw new Error(
        `Undefined test type ${type} for build targets ${buildTargets}`
      );
    }
    const action = testTypeBuildTargets.some((target) =>
      buildTargets.has(target)
    )
      ? 'queued'
      : 'skipped';
    for (const subType of subTypes) {
      await postReport(`${type}/${subType}`, action);
    }
  }
}

/**
 * Callback to the Karma.Server on('run_complete') event for simple test types.
 *
 * @param {!Karma.TestResults} results
 */
async function reportTestRunComplete(results) {
  if (results.error) {
    await reportTestErrored();
  } else {
    await reportTestFinished(results.success, results.failed);
  }
}

module.exports = {
  reportAllExpectedTests,
  reportTestErrored,
  reportTestFinished,
  reportTestRunComplete,
  reportTestSkipped,
  reportTestStarted,
};
