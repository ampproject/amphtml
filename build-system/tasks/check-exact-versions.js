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

const globby = require('globby');
const {cyan, green, red} = require('kleur/colors');
const {getStderr} = require('../common/exec');
const {gitDiffFileMaster} = require('../common/git');
const {log, logLocalDev, logWithoutTimestamp} = require('../common/logging');

const checkerExecutable = 'npx npm-exact-versions';

/**
 * Makes sure all package.json files in the repo use exact versions.
 * @return {!Promise}
 */
async function checkExactVersions() {
  let success = true;
  const packageJsonFiles = globby.sync(['**/package.json', '!**/node_modules']);
  packageJsonFiles.forEach((file) => {
    const checkerCmd = `${checkerExecutable} --path ${file}`;
    const err = getStderr(checkerCmd);
    if (err) {
      log(
        red('ERROR:'),
        'One or more packages in',
        cyan(file),
        'do not have an exact version.'
      );
      logWithoutTimestamp(gitDiffFileMaster(file));
      success = false;
    } else {
      logLocalDev(
        green('SUCCESS:'),
        'All packages in',
        cyan(file),
        'have exact versions.'
      );
    }
  });
  if (success) {
    return Promise.resolve();
  } else {
    const reason = new Error('Check failed');
    reason.showStack = false;
    return Promise.reject(reason);
  }
}

module.exports = {
  checkExactVersions,
};

checkExactVersions.description =
  'Checks that all package.json files in the repo use exact versions.';
