/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
const colors = require('ansi-colors');
const config = require('../config');
const eslint = require('gulp-eslint');
const gulp = require('gulp-help')(require('gulp'));
const gulpIf = require('gulp-if');
const lazypipe = require('lazypipe');
const log = require('fancy-log');
const watch = require('gulp-watch');

const isWatching = (argv.watch || argv.w) || false;

const options = {
  fix: false,
  rulePaths: ['build-system/eslint-rules/'],
};

/**
 * Checks if current Vinyl file has been fixed by eslint.
 * @param {!Vinyl} file
 * @return {boolean}
 */
function isFixed(file) {
  // Has ESLint fixed the file contents?
  return file.eslint != null && file.eslint.fixed;
}

/**
 * Initializes the linter stream based on globs
 * @param {!Object} globs
 * @param {!Object} streamOptions
 * @return {!ReadableStream}
 */
function initializeStream(globs, streamOptions) {
  let stream = gulp.src(globs, streamOptions);
  if (isWatching) {
    const watcher = lazypipe().pipe(watch, globs);
    stream = stream.pipe(watcher());
  }
  return stream;
}

/**
 * Logs a message on the same line to indicate progress
 * @param {string} message
 */
function logOnSameLine(message) {
  if (!process.env.TRAVIS) {
    process.stdout.moveCursor(0, -1);
    process.stdout.cursorTo(0);
    process.stdout.clearLine();
  }
  log(message);
}

/**
 * Runs the linter on the given stream using the given options.
 * @param {string} path
 * @param {!ReadableStream} stream
 * @param {!Object} options
 * @return {boolean}
 */
function runLinter(path, stream, options) {
  let errorsFound = false;
  if (!process.env.TRAVIS) {
    log(colors.green('Starting linter...'));
  }
  return stream.pipe(eslint(options))
      .pipe(eslint.formatEach('stylish', function(msg) {
        errorsFound = true;
        logOnSameLine(colors.red('Linter error:') + msg + '\n');
      }))
      .pipe(gulpIf(isFixed, gulp.dest(path)))
      .pipe(eslint.result(function(result) {
        if (!process.env.TRAVIS) {
          logOnSameLine(colors.green('Linting: ') + result.filePath);
        }
      }))
      .pipe(eslint.results(function(results) {
        if (results.errorCount == 0) {
          if (!process.env.TRAVIS) {
            logOnSameLine(colors.green('Success: ') + 'No linter errors');
          }
        } else {
          logOnSameLine(colors.red('Error: ') + results.errorCount +
              ' linter error(s) found.');
          process.exit(1);
        }
      }))
      .pipe(eslint.failAfterError())
      .on('error', function() {
        if (errorsFound && !options.fix) {
          log(colors.red('ERROR:'),
              'Lint errors found.');
          log(colors.yellow('NOTE:'),
              'You can run', colors.cyan('gulp lint --fix'),
              'to automatically fix some of these lint errors.');
          log(colors.yellow('WARNING:'),
              'Since this is a destructive operation (operates on the file',
              'system), make sure you commit before running the command.');
        }
      });
}

/**
 * Run the eslinter on the src javascript and log the output
 * @return {!Stream} Readable stream
 */
function lint() {
  if (argv.fix) {
    options.fix = true;
  }
  const stream = initializeStream(config.lintGlobs, {});
  return runLinter('.', stream, options);
}


gulp.task(
    'lint',
    'Validates against Google Closure Linter',
    ['update-packages'],
    lint,
    {
      options: {
        'watch': '  Watches for changes in files, validates against the linter',
        'fix': '  Fixes simple lint errors (spacing etc).',
      },
    });
