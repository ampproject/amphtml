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
const fs = require('fs');
const getStdout = require('./exec.js').getStdout;
const path = require('path');

const sauceCredsFile = path.resolve('build-system/sauce-credentials.json');


/**
 * Prints out per-user Sauce labs credentials if available, so they can be set
 * in .travis.yml.
 *
 * @param {!Array<string>} argv
*/
function main(argv) {
  let committer = getStdout(`git log -1 --pretty=format:'%ae'`).trim();
  let credentials = JSON.parse(fs.readFileSync(sauceCredsFile)).credentials;
  if (!credentials) {
    return 1;
  }

  let sauceUser = 'amphtml';
  if (credentials[committer]) {
    sauceUser = committer;
  }
  let username = credentials[sauceUser].username;
  let access_key_encrypted = credentials[sauceUser].access_key_encrypted.trim();

  if (process.argv.indexOf('--username') !== -1) {
    console/*OK*/.log('"' + username + '"');
  } else if (process.argv.indexOf('--access_key_encrypted')!== -1) {
    console/*OK*/.log('"' + access_key_encrypted + '"');
  }

  return 0;
}

main();