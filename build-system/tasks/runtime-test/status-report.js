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
  let type;
  if (IS_UNIT) {
    type = 'unit';
  } else if (IS_INTEGRATION) {
    type = 'integration';

    // TODO(danielrozenberg): report integration on saucelabs
    if (IS_SAUCELABS) {
      return null;
    }
  } else {
    return null;
  }

  if (IS_LOCAL_CHANGES) {
    return `${type}/local-changes`;
  } else if (IS_SAUCELABS) {
    return `${type}/saucelabs`;
  } else if (IS_SINGLE_PASS) {
    return `${type}/single-pass`;
  } else {
    return `${type}/standard`;
  }
}

function postReport(action) {
  const type = inferTestType();
  if (type !== null && isTravisPullRequestBuild()) {
    const commitHash = gitCommitHash();
    const postUrl = `${reportBaseUrl}/${commitHash}/${type}/${action}`;
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
