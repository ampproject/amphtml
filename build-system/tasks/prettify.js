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
const gulp = require('gulp');
const log = require('fancy-log');
const path = require('path');
const prettier = require('gulp-prettier');
const {getFilesChanged, logOnSameLine} = require('../common/utils');
const {green, cyan, red, yellow} = require('ansi-colors');
const {isTravisBuild} = require('../common/travis');
const {maybeUpdatePackages} = require('./update-packages');
const {prettifyGlobs} = require('../test-configs/config');

const rootDir = path.dirname(path.dirname(__dirname));

// Message header printed by gulp-prettier before the list of files with errors.
// See https://github.com/bhargavrpatel/gulp-prettier/blob/master/index.js#L90
const header =
  'Code style issues found in the following file(s). Forgot to run Prettier?';

/**
 * Logs the list of files that will be checked.
 *
 * @param {!Array<string>} files
 */
function logFiles(files) {
  if (!isTravisBuild()) {
    log(green('INFO: ') + 'Prettifying the following files:');
    files.forEach(file => {
      log(cyan(file));
    });
  }
}

/**
 * Checks files for formatting (and optionally fixes them) with Prettier.
 *
 * @return {!Promise}
 */
function prettify() {
  maybeUpdatePackages();
  let filesToCheck;
  if (argv.files) {
    filesToCheck = globby.sync(argv.files.split(','));
    logFiles(filesToCheck);
  } else if (argv.local_changes) {
    filesToCheck = getFilesChanged(prettifyGlobs);
    if (filesToCheck.length == 0) {
      log(green('INFO: ') + 'No prettifiable files in this PR');
      return Promise.resolve();
    } else {
      logFiles(filesToCheck);
    }
  } else {
    filesToCheck = globby.sync(prettifyGlobs, {dot: true});
  }
  return runPrettify(filesToCheck);
}

/**
 * Runs prettier on the given list of files with gulp-prettier.
 *
 * @param {!Array<string>} filesToCheck
 * @return {!Promise}
 */
function runPrettify(filesToCheck) {
  if (!isTravisBuild()) {
    log(green('Starting checks...'));
  }
  return new Promise((resolve, reject) => {
    const onData = data => {
      if (!isTravisBuild()) {
        logOnSameLine(green('Checked: ') + path.relative(rootDir, data.path));
      }
    };

    const rejectWithReason = reasonText => {
      const reason = new Error(reasonText);
      reason.showStack = false;
      reject(reason);
    };

    const printFixMessages = () => {
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
      log(
        yellow('NOTE 3:'),
        'For more information, read',
        cyan(
          'https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-e2e.md#code-quality-and-style\n'
        )
      );
    };

    const onError = error => {
      if (error.message.startsWith(header)) {
        const filesWithErrors = error.message
          .replace(header, '')
          .trim()
          .split('\n');
        const reason = 'Found formatting errors in one or more files';
        logOnSameLine(red('ERROR: ') + reason + ':');
        filesWithErrors.forEach(file => {
          log(cyan(file));
        });
        printFixMessages();
        rejectWithReason(reason);
      } else {
        const reason = 'Found an unrecoverable error';
        logOnSameLine(red('ERROR: ') + reason + ':');
        log(error.message);
        rejectWithReason(reason);
      }
    };

    const onFinish = () => {
      if (!isTravisBuild()) {
        logOnSameLine('Checked ' + cyan(filesToCheck.length) + ' file(s)');
      }
      resolve();
    };

    if (argv.fix) {
      return gulp
        .src(filesToCheck)
        .pipe(prettier())
        .on('data', onData)
        .on('error', onError)
        .pipe(gulp.dest(file => file.base))
        .on('finish', onFinish);
    } else {
      return gulp
        .src(filesToCheck)
        .pipe(prettier.check())
        .on('data', onData)
        .on('error', onError)
        .on('finish', onFinish);
    }
  });
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
