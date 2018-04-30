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
  if (!process.env.TRAVIS && process.stdout.isTTY) {
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
  if (!process.env.TRAVIS) {
    log(colors.green('Starting linter...'));
  } else {
    // TODO(jridgewell, #14761): Remove log folding after #14761 is fixed.
    log(colors.bold(colors.yellow('Lint results: ')) + 'Expand this section');
    console./* OK*/log('travis_fold:start:lint_results\n');
  }
  return stream.pipe(eslint(options))
      .pipe(eslint.formatEach('stylish', function(msg) {
        logOnSameLine(msg.trim() + '\n');
      }))
      .pipe(gulpIf(isFixed, gulp.dest(path)))
      .pipe(eslint.result(function(result) {
        if (!process.env.TRAVIS) {
          logOnSameLine(colors.green('Linted: ') + result.filePath);
        }
      }))
      .pipe(eslint.results(function(results) {
        // TODO(jridgewell, #14761): Remove log folding after #14761 is fixed.
        if (process.env.TRAVIS) {
          console./* OK*/log('travis_fold:end:lint_results');
        }
        if (results.errorCount == 0 && results.warningCount == 0) {
          if (!process.env.TRAVIS) {
            logOnSameLine(colors.green('SUCCESS: ') +
                'No linter warnings or errors.');
          }
        } else {
          const prefix = results.errorCount == 0 ?
            colors.yellow('WARNING: ') : colors.red('ERROR: ');
          logOnSameLine(prefix + 'Found ' +
              results.errorCount + ' error(s) and ' +
              results.warningCount + ' warning(s).');
          if (!options.fix) {
            log(colors.yellow('NOTE 1:'),
                'You may be able to automatically fix some of these warnings ' +
                '/ errors by running', colors.cyan('gulp lint --fix') + '.');
            log(colors.yellow('NOTE 2:'),
                'Since this is a destructive operation (operates on the file',
                'system), make sure you commit before running the command.');
          }
        }
      }))
      .pipe(eslint.failAfterError());
}

/**
 * Run the eslinter on the src javascript and log the output
 * @return {!Stream} Readable stream
 */
function lint() {
  if (argv.fix) {
    options.fix = true;
  }
  if (argv.files) {
    config.lintGlobs[config.lintGlobs.indexOf('**/*.js')] = argv.files;
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
