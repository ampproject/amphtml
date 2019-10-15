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
const deglob = require('globs-to-files');
const log = require('fancy-log');
const path = require('path');
const {getOutput} = require('../common/exec');
const {green, cyan, red, yellow} = require('ansi-colors');
const {highlight} = require('cli-highlight');
const {isTravisBuild} = require('../common/travis');

const rootDir = path.dirname(path.dirname(__dirname));
const prettierCmd = 'node_modules/.bin/prettier';

/**
 * Prettier exit codes. See https://prettier.io/docs/en/cli.html#exit-codes
 * @enum {number}
 */
const PrettierResult = {
  SUCCESS: 0,
  FAILURE: 1,
  ERROR: 2,
};

/**
 * Checks OWNERS files for formatting (and optionally fixes them) with Prettier.
 * Coming up: Check for correctness using the amp-github-apps API. See
 * https://github.com/ampproject/amp-github-apps/issues/281.
 * The cumulative result is returned to the `gulp` process via process.exitCode
 * so that all OWNERS files can be checked / fixed.
 */
async function checkOwners() {
  const filesToCheck = deglob.sync(
    argv.files ? argv.files.split(',') : ['**/OWNERS']
  );
  filesToCheck.forEach(file => {
    const relativePath = path.relative(rootDir, file);
    checkFormatting(relativePath);
    // TODO(ampproject/amp-github-apps #281): Add a check for correctness.
  });
  if (process.exitCode == 1) {
    log(red('ERROR:'), 'Found errors in one or more', cyan('OWNERS'), 'files.');
    if (!argv.fix) {
      log(
        yellow('NOTE 1:'),
        'You may be able to automatically fix some of these warnings ' +
          '/ errors by running',
        cyan('gulp check-owners --fix'),
        'from your local branch.'
      );
      log(
        yellow('NOTE 2:'),
        'Since this is a destructive operation (that edits your files',
        'in-place), make sure you commit before running the command.'
      );
    }
  }
}

/**
 * Fixes the formatting of a single OWNERS file
 * @param {string} file
 */
function fixFormatting(file) {
  const fixCmd = `${prettierCmd} --write ${file}`;
  const fixResult = getOutput(fixCmd);
  if (fixResult.status == PrettierResult.SUCCESS) {
    log(green('SUCCESS:'), 'Fixed', cyan(file));
  } else {
    log(red('ERROR:'), 'Could not fix', cyan(file));
    console.log(highlight(fixResult.stderr, {ignoreIllegals: true}));
    process.exitCode = 1;
  }
}

/**
 * Checks and optionally fixes the formatting of a single OWNERS file.
 * @param {string} file
 */
function checkFormatting(file) {
  if (!file.endsWith('OWNERS')) {
    log(red('ERROR:'), cyan(file), 'is not an', cyan('OWNERS'), 'file.');
    process.exitCode = 1;
    return;
  }
  const checkCmd = `${prettierCmd} --list-different ${file}`;
  const checkResult = getOutput(checkCmd);
  if (checkResult.status == PrettierResult.SUCCESS) {
    if (!isTravisBuild()) {
      log(green('SUCCESS:'), 'No errors in', cyan(file));
    }
  } else if (checkResult.status == PrettierResult.FAILURE) {
    if (argv.fix) {
      fixFormatting(file);
    } else {
      log(red('FAILURE:'), 'Found errors in', cyan(file));
      process.exitCode = 1;
    }
  } else {
    log(red('ERROR:'), 'Could not parse', cyan(file));
    console.log(highlight(checkResult.stderr.trim(), {ignoreIllegals: true}));
    process.exitCode = 1;
  }
}

module.exports = {
  checkOwners,
};

checkOwners.description = 'Checks all OWNERS files in the repo for formatting.';
checkOwners.flags = {
  'files': '  Checks only the specified OWNERS files',
  'fix': '  Fixes formatting errors in OWNERS files',
};
