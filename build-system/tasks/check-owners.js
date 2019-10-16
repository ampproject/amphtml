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

/**
 * @fileoverview This file implements the `gulp check-owners` task, which checks
 * all OWNERS files in the repo for correctness, as determined by the parsing
 * API provided by the AMP owners bot.
 */

'use strict';

const deglob = require('globs-to-files');
const fs = require('fs-extra');
const JSON5 = require('json5');
const log = require('fancy-log');
const path = require('path');
const {cyan, red, green} = require('ansi-colors');
const {isTravisBuild} = require('../common/travis');

const rootDir = path.dirname(path.dirname(__dirname));

/**
 * Checks OWNERS files for correctness using the owners bot API.
 * The cumulative result is returned to the `gulp` process via process.exitCode
 * so that all OWNERS files can be checked / fixed.
 */
async function checkOwners() {
  const filesToCheck = deglob.sync(['**/OWNERS']);
  filesToCheck.forEach(file => {
    const relativePath = path.relative(rootDir, file);
    checkFile(relativePath);
  });
}

/**
 * Checks a single OWNERS file using the owners bot API.
 * @param {string} file
 */
function checkFile(file) {
  if (!file.endsWith('OWNERS')) {
    log(red('ERROR:'), cyan(file), 'is not an', cyan('OWNERS'), 'file.');
    process.exitCode = 1;
    return;
  }

  // TODO(rcebulko): Replace this placeholder with a check that uses the
  // owners-bot parsing API.
  // See https://github.com/ampproject/amp-github-apps/issues/281.
  const contents = fs.readFileSync(file, 'utf8').toString();
  try {
    JSON5.parse(contents);
    if (!isTravisBuild()) {
      log(green('SUCCESS:'), 'No errors in', cyan(file));
    }
  } catch {
    log(red('FAILURE:'), 'Found errors in', cyan(file));
    process.exitCode = 1;
  }
}

module.exports = {
  checkOwners,
};

checkOwners.description = 'Checks all OWNERS files in the repo for correctness';
checkOwners.flags = {
  'files': '  Checks only the specified OWNERS files',
};
