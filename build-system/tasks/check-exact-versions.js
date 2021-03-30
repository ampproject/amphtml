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

const fs = require('fs-extra');
const globby = require('globby');
const semver = require('semver');
const {cyan, green, red} = require('kleur/colors');
const {gitDiffFileMaster} = require('../common/git');
const {log, logLocalDev, logWithoutTimestamp} = require('../common/logging');

/**
 * @param {string} file
 * @return {boolean}
 */
function check(file) {
  const json = fs.readJsonSync(file, 'utf8');

  // We purposfully ignore peerDependencies here, because that's that's for the
  // consumer to decide.
  const keys = ['dependencies', 'devDependencies', 'optionalDependencies'];

  for (const key of keys) {
    const deps = json[key];
    for (const dep in deps) {
      const version = deps[dep];
      if (!semver.clean(version)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Makes sure all package.json files in the repo use exact versions.
 * @return {!Promise}
 */
async function checkExactVersions() {
  const packageJsonFiles = globby.sync(['**/package.json', '!**/node_modules']);
  packageJsonFiles.forEach((file) => {
    if (check(file)) {
      logLocalDev(
        green('SUCCESS:'),
        'All packages in',
        cyan(file),
        'have exact versions.'
      );
    } else {
      log(
        red('ERROR:'),
        'One or more packages in',
        cyan(file),
        'do not have an exact version.'
      );
      logWithoutTimestamp(gitDiffFileMaster(file));
      throw new Error('Check failed');
    }
  });
}

module.exports = {
  checkExactVersions,
};

checkExactVersions.description =
  'Checks that all package.json files in the repo use exact versions.';
