/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
'using strict';

const {getFilesToCheck} = require('../common/utils');
const {getStdout} = require('../common/process');
const {green, red} = require('kleur/colors');
const {invalidWhitespaceGlobs} = require('../test-configs/config');
const {log, logLocalDev, logWithoutTimestamp} = require('../common/logging');

/**
 * Runs the check on the given list of files and prints results. Uses the
 * built-in functionality of `git diff --check` to generate results. Checks
 * entire files by comparing their contents against an empty commit.
 *
 * @param {Array<string>} filesToCheck
 */
function runCheck(filesToCheck) {
  logLocalDev(green('Checking files for invalid whitespaces...'));
  const fileList = filesToCheck.join(' ');
  const emptyCommit = getStdout('git hash-object -t tree /dev/null').trim();
  const checkFileCmd = `git -c color.ui=always diff ${emptyCommit} --check ${fileList}`;
  const result = getStdout(checkFileCmd).trim();
  if (result.length) {
    logWithoutTimestamp(result);
    log(red('ERROR:'), 'Please fix the files listed above.');
    process.exitCode = 1;
  } else {
    log(green('SUCCESS:'), 'No invalid whitespaces found.');
  }
}

/**
 * Checks multiple kinds of files for invalid whitespaces.
 */
function checkInvalidWhitespaces() {
  const filesToCheck = getFilesToCheck(
    invalidWhitespaceGlobs,
    {dot: true},
    '.gitignore'
  );
  if (filesToCheck.length == 0) {
    return;
  }
  runCheck(filesToCheck);
}

checkInvalidWhitespaces.description =
  'Checks different types of files for invalid whitespaces.';
checkInvalidWhitespaces.flags = {
  'files': 'Checks just the specified files',
  'local_changes': 'Checks just the files changed in the local branch',
};

module.exports = {
  checkInvalidWhitespaces,
};
