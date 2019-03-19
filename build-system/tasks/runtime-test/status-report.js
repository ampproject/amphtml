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
const log = require('fancy-log');
const requestPromise = require('request-promise');
const {cyan, green, yellow} = require('ansi-colors');
const {gitCommitHash} = require('../../git');
const {isTravisPullRequestBuild} = require('../../travis');

const reportBaseUrl = 'https://amp-test-status-bot.appspot.com/v0/tests';

const IS_INTEGRATION = !!argv.integration;
const IS_LOCAL_CHANGES = !!argv['local-changes'];
const IS_SAUCELABS = !!(argv.saucelabs || argv.saucelabs_lite);
const IS_SINGLE_PASS = !!argv.single_pass;
const IS_UNIT = !!argv.unit;

function inferTestType() {
  if (IS_INTEGRATION) {
    if (IS_SAUCELABS) {
      // TODO(danielrozenberg): report integration on saucelabs
      return null;
    }
    return 'integration' + (IS_SINGLE_PASS ? '-single-pass' : '');
  } else if (IS_LOCAL_CHANGES) {
    return 'local-changes';
  } else if (IS_UNIT) {
    return 'unit' + (IS_SAUCELABS ? '-saucelabs' : '');
  }
  return null;
}

function postReport(action) {
  const type = inferTestType();
  if (type !== null && isTravisPullRequestBuild()) {
    const commitHash = gitCommitHash();
    const postUrl = `${reportBaseUrl}/${commitHash}/${type}/${action}`;
    log(green('DEBUG:'), type, commitHash, postUrl);
    return requestPromise.post(postUrl)
        .then(body => {
          log(green('Info:'), 'reported', cyan(`${type}/${action}`),
              'to the test-status GitHub App');
          log(green('Info:'), 'response from test-status was',
              body.length ? 'empty' : cyan(body.substr(0, 100)));
        }).catch(error => {
          log(yellow('Warning:'), 'failed to report', cyan(`${type}/${action}`),
              'to the test-status GitHub App:\n', error.message.substr(0, 100));
          return;
        });
  }
  log(green('DEBUG:'), IS_INTEGRATION, IS_LOCAL_CHANGES, IS_SAUCELABS,
      IS_SINGLE_PASS, IS_UNIT, type);
  return Promise.resolve();
}

exports.reportTestErrored = () => {
  return postReport('report/errored');
};

exports.reportTestFinished = (success, failed) => {
  return postReport(`report/${success}/${failed}`);
};

exports.reportTestQueued = () => {
  return postReport('queued');
};

exports.reportTestStarted = () => {
  return postReport('started');
};

exports.reportTestSkipped = () => {
  return postReport('skipped');
};
