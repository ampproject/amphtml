/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

const log = require('fancy-log');
const {cyan, red} = require('ansi-colors');

//TODO(estherkim): delete this file at some point
function deprecateTaskWarning() {
  const pattern = '~ * ';
  log(cyan(pattern.repeat(27)));
  log(red('Attention Please!'));
  log(
    cyan('gulp test [--unit | --integration]'),
    'has been renamed to new, separate tasks:',
    cyan('gulp unit'),
    'and',
    cyan('gulp integration.')
  );
  log(
    cyan('--local-changes'),
    'has been changed to',
    cyan('--local_changes'),
    'and',
    cyan('--saucelabs-lite'),
    'has been renamed to',
    cyan('--saucelabs')
  );
  log(
    'All other flags remain the same and our documentation has been updated to reflect these changes.'
  );
  log('Thanks!', red('<3'), '@ampproject/wg-infra');
  log(cyan(pattern.repeat(27)));
}

async function test() {
  deprecateTaskWarning();
}

module.exports = {
  test,
};

/* eslint "google-camelcase/google-camelcase": 0 */

test.description = 'Runs tests (DEPRECIATED)';
