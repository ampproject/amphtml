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
const request = require('request');
const {cyan, green, yellow} = require('ansi-colors');
const {gitCommitHash} = require('../../git');
const {isTravisPullRequestBuild} = require('../../travis');

const reportBaseUrl = 'https://amp-test-status-bot.appspot.com/v0/tests/';

function inferTestType() {
  if (argv['local-changes']) {
    return 'local-changes';
  }
  if (argv.single_pass) {
    return null;
  }
  let type;
  if (argv.integration) {
    type = 'integration';
  }
  if (argv.unit) {
    type = 'unit';
  }
  if (type !== null && (argv.saucelabs || argv.saucelabs_lite)) {
    type += '/saucelabs';
  }
  return null;
}

function postReport(action) {
  const type = inferTestType();
  if (type !== null && isTravisPullRequestBuild()) {
    const commitHash = gitCommitHash();
    const postUrl = `${reportBaseUrl}/${commitHash}/${type}/${action}`;
    request.post(postUrl, (error, response, body) => {
      if (error) {
        log(yellow('Warning:'), 'failed to report', cyan(action),
            'to the test-status GitHub App:\n', error);
        return;
      }

      log(green('Info:', 'reported', cyan(action),
          'to the test-status GitHub App. Response status code:',
          cyan(response.statusCode), cyan(response.statusMessage)));
      if (response.statusCode > 299) {
        log(green('Warning:'), 'response from test-status was:\n',
            body.substr(0, 100));
      }
    });
  }
}

exports.reportTestErrored = () => {
  postReport('report/errored');
};

exports.reportTestFinished = (success, failed) => {
  postReport(`report/${success}/${failed}`);
};

exports.reportTestQueued = () => {
  postReport('queued');
};

exports.reportTestStarted = () => {
  postReport('started');
};

exports.reportTestSkipped = () => {
  postReport('skipped');
};
