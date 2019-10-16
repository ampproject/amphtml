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
const gulp = require('gulp');
const log = require('fancy-log');
const path = require('path');
const tap = require('gulp-tap');
const {getOutput} = require('../common/exec');
const {green, cyan, red, yellow} = require('ansi-colors');
const {highlight} = require('cli-highlight');
const {isTravisBuild} = require('../common/travis');
const {logOnSameLine} = require('../common/utils');
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
 * Checks files for formatting (and optionally fixes them) with Prettier.
 * Returns the cumulative result to the `gulp` process via  process.exitCode so
 * that all files can be checked / fixed.
 *
 * @return {!Promise}
 */
function prettify() {
  const filesToCheck = argv.files ? argv.files.split(',') : prettifyGlobs;
  return gulp
    .src(filesToCheck)
    .pipe(
      tap(file => {
        checkFile(path.relative(rootDir, file.path));
      })
    )
    .on('finish', () => {
      if (process.exitCode == 1) {
        logOnSameLine(red('ERROR: ') + 'Found errors in one or more files.');
        if (!argv.fix) {
          log(
            yellow('NOTE 1:'),
            'You may be able to automatically fix some errors by running',
            cyan('gulp prettify --fix'),
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
    });
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
  'fix': '  Fixes formatting errors',
};
