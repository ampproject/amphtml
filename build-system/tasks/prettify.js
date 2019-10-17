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
 * @fileoverview This file implements the `gulp prettify` task, which uses
 * prettier to check (and optionally fix) the formatting in a variety of
 * non-JS files in the repo. (JS files are separately checked by `gulp lint`,
 * which uses eslint.)
 */
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const globby = require('globby');
const log = require('fancy-log');
const path = require('path');
const {getFilesChanged, logOnSameLine} = require('../common/utils');
const {getOutput} = require('../common/exec');
const {green, cyan, red, yellow} = require('ansi-colors');
const {highlight} = require('cli-highlight');
const {isTravisBuild} = require('../common/travis');
const {maybeUpdatePackages} = require('./update-packages');
const {prettifyGlobs} = require('../test-configs/config');

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
 * Logs the list of files that will be checked.
 *
 * @param {!Array<string>} files
 */
function logFiles(files) {
  if (!isTravisBuild()) {
    log(green('INFO: ') + 'Prettifying the following files:');
    files.forEach(file => {
      log(cyan(path.relative(rootDir, file)));
    });
  }
}

/**
 * Checks files for formatting (and optionally fixes them) with Prettier.
 */
async function prettify() {
  maybeUpdatePackages();
  let filesToCheck;
  if (argv.files) {
    filesToCheck = globby.sync(argv.files.split(','));
    logFiles(filesToCheck);
  } else if (argv.local_changes) {
    filesToCheck = getFilesChanged(prettifyGlobs);
    if (filesToCheck.length == 0) {
      log(green('INFO: ') + 'No prettifiable files in this PR');
      return;
    } else {
      logFiles(filesToCheck);
    }
  } else {
    filesToCheck = globby.sync(prettifyGlobs);
  }
  runPrettify(filesToCheck);
}

/**
 * Runs prettier on the given list of files. Returns the cumulative result to
 * the `gulp` process via  process.exitCode so all files can be checked / fixed.
 *
 * @param {!Array<string>} filesToCheck
 */
function runPrettify(filesToCheck) {
  if (!isTravisBuild()) {
    log(green('Starting checks...'));
  }
  filesToCheck.forEach(file => {
    checkFile(path.relative(rootDir, file));
  });
  if (process.exitCode == 1) {
    logOnSameLine(red('ERROR: ') + 'Found errors in one or more files.');
    if (!argv.fix) {
      log(
        yellow('NOTE 1:'),
        'You may be able to automatically fix some errors by running',
        cyan('gulp prettify --local_changes --fix'),
        'from your local branch.'
      );
      log(
        yellow('NOTE 2:'),
        'Since this is a destructive operation (that edits your files',
        'in-place), make sure you commit before running the command.'
      );
    }
  } else {
    if (!isTravisBuild()) {
      logOnSameLine(green('SUCCESS: ') + 'No formatting errors found.');
    }
  }
}

/**
 * Fixes the formatting of a single file
 * @param {string} file
 */
function fixFile(file) {
  const fixCmd = `${prettierCmd} --write ${file}`;
  const fixResult = getOutput(fixCmd);
  if (fixResult.status == PrettierResult.SUCCESS) {
    logOnSameLine(green('Fixed: ') + file + '\n');
  } else {
    logOnSameLine(red('Could not fix: ') + file);
    console.log(highlight(fixResult.stderr, {ignoreIllegals: true}), '\n');
    process.exitCode = 1;
  }
}

/**
 * Checks and optionally fixes the formatting of a single file.
 * @param {string} file
 */
function checkFile(file) {
  const checkCmd = `${prettierCmd} --list-different ${file}`;
  const checkResult = getOutput(checkCmd);
  if (checkResult.status == PrettierResult.SUCCESS) {
    if (!isTravisBuild()) {
      logOnSameLine(green('Checked: ') + file);
    }
  } else if (checkResult.status == PrettierResult.FAILURE) {
    if (argv.fix) {
      fixFile(file);
    } else {
      logOnSameLine(red('Found errors in: ') + file + '\n');
      process.exitCode = 1;
    }
  } else {
    logOnSameLine(red('Could not parse: ') + file);
    console.log(
      highlight(checkResult.stderr.trim(), {ignoreIllegals: true}),
      '\n'
    );
    process.exitCode = 1;
  }
}

module.exports = {
  prettify,
};

prettify.description =
  'Checks several non-JS files in the repo for formatting using prettier';
prettify.flags = {
  'files': '  Checks only the specified files',
  'local_changes': '  Checks just the files changed in the local branch',
  'fix': '  Fixes formatting errors',
};
