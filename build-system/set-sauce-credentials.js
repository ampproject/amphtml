/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview This file extracts the committer's per-user Sauce Labs
 * credentials if available, so they can be used to override the amphtml Sauce
 * Labs credentials.
 */
const atob = require('atob');
const fs = require('fs');
const getStdout = require('./exec.js').getStdout;
const path = require('path');
const util = require('gulp-util');

const fileLogPrefix = util.colors.yellow.bold('set-sauce-credentials.js:');
const sauceCredsFile = path.resolve('build-system/sauce-credentials.json');


/**
 * Prints out per-user Sauce labs credentials if available, so they can be set
 * in .travis.yml.
 */
function main() {
  let committer = getStdout(`git log -1 --pretty=format:'%ae'`).trim();
  let credentials = JSON.parse(fs.readFileSync(sauceCredsFile)).credentials;
  if (!credentials) {
    console/*OK*/.log(fileLogPrefix, util.colors.red('ERROR:'),
        'Could not load Sauce Labs credentials from',
        util.colors.cyan(sauceCredsFile));
    return 1;
  }

  if (credentials[committer]) {
    let username = credentials[committer].username;
    let access_key = atob(credentials[committer].access_key_encoded).trim();
    console/*OK*/.log(
        'export SAUCE_USERNAME=' + username +
        ' SAUCE_ACCESS_KEY=' + access_key);
  }
  return 0;
}

process.exit(main());
