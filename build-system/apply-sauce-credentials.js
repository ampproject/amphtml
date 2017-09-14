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
const {
  exec,
  getStdout
} = require('./exec.js');
const path = require('path');

const defaultSauceUser = 'amphtml';
const sauceCredsFile = path.resolve('build-system/sauce-credentials.json');
const travisYmlFile = path.resolve('.travis.yml');


/**
 * Generates the a command that replaces the given placeholder in .travis.yml.
 *
 * @param {string} replacement
 * @param {string} placeholder
 * @return {string}
 */
function createReplaceCmd(placeholder, replacement) {
  return `sed -i -e 's:${placeholder}:${replacement}:g' ${travisYmlFile}`;
}

/**
 * Extracts per-user Sauce credentials, and if available, updates .travis.yml.
 * The text output of this function is used to return the status.
 *
 * @param {!Array<string>} argv
 */
function main(argv) {
  if(!fs.existsSync(sauceCredsFile)) {
    console/*OK*/.log('COULD_NOT_READ_SAUCE_CREDENTIALS_FILE');
    return 1;
  }
  let sauceCreds = fs.readFileSync(sauceCredsFile);
  let credentials = JSON.parse(sauceCreds).credentials;
  if (!credentials) {
    console/*OK*/.log('COULD_NOT_EXTRACT_CREDENTIALS');
    return 1;
  }

  let sauceUser = defaultSauceUser;
  let committer = getStdout(`git log -1 --pretty=format:'%ae'`).trim();
  if (credentials[committer]) {
    sauceUser = committer;
  }
  let username = credentials[sauceUser].username;
  let accesskeyEncrypted = credentials[sauceUser].access_key_encrypted.trim();

  exec(createReplaceCmd('PLACEHOLDER_SAUCE_USERNAME', username));
  exec(createReplaceCmd(
      'PLACEHOLDER_SAUCE_ACCESS_KEY_ENCRYPTED', accesskeyEncrypted));

  console/*OK*/.log('SUCCESS');
  return 0;
}

process.exit(main());
