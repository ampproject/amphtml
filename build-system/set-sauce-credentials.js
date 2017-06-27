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
 * @fileoverview This file overrides the amphtml Sauce Labs credentials with
 * per-user credentials if available.
 */
const atob = require('atob');
const fs = require('fs');
const getStdout = require('./exec.js').getStdout;
const path = require('path');
const util = require('gulp-util');

const fileLogPrefix = util.colors.yellow.bold('set-sauce-credentials.js:');
const sauceCredsFile = path.resolve('build-system/sauce-credentials.json');


/**
 * Connect to sauce labs using per-user credentials if available, and amphtml
 * credentials if not available.
 */
function main() {
  let committer = getStdout(`git log -1 --pretty=format:'%ae'`).trim();
  let credentials = JSON.parse(fs.readFileSync(sauceCredsFile)).credentials;
  if (credentials === null) {
    console.log(fileLogPrefix, util.colors.red('ERROR:'),
        'Could not load Sauce labs credentials from',
        util.colors.cyan(sauceCredsFile));
    return 1;
  }

  if (credentials[committer]) {
    let username = credentials[committer].username;
    let access_key = atob(credentials[committer].access_key_encoded).trim();
    console.log(fileLogPrefix,
        'Using Sauce credentials for user', util.colors.cyan(committer),
        'with Sauce username', util.colors.cyan(username));
    process.env['SAUCE_USERNAME'] = username;
    process.env['SAUCE_ACCESS_KEY'] = access_key;
  }
  return 0;
}

process.exit(main());
