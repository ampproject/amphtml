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


var argv = require('minimist')(process.argv.slice(2));
var config = require('../config');
var eslint = require('gulp-eslint');
var getStdout = require('../exec.js').getStdout;
var gulp = require('gulp-help')(require('gulp'));
var gulpIf = require('gulp-if');
var lazypipe = require('lazypipe');
var path = require('path');
var util = require('gulp-util');
var watch = require('gulp-watch');

var isWatching = (argv.watch || argv.w) || false;

var options = {
  fix: false,
  rulePaths: ['build-system/eslint-rules/'],
  plugins: ['eslint-plugin-google-camelcase'],
};
var buildSystemOptions = {
  fix: false,
  plugins: ['eslint-plugin-google-camelcase'],
};

/**
 * On travis, we'll start by linting just the build-system files that are being
 * changed in the current PR. For local runs, we lint all build-system files.
 *
 * @return {!Array<string>}
 */
function getBuildSystemFiles() {
  if (!!process.env.TRAVIS_PULL_REQUEST_SHA) {
    var filesInPr =
        getStdout(`git diff --name-only master...HEAD`).trim().split('\n');
    return filesInPr.filter(function(file) {
      return file.startsWith('build-system') && path.extname(file) == '.js'
    });
  } else {
    return config.buildSystemLintGlobs;
  }
}

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
 * @param {!object} globs
 * @param {!object} streamOptions
 * @return {!ReadableStream}
 */
function initializeStream(globs, streamOptions) {
  var stream = gulp.src(globs, streamOptions);
  if (isWatching) {
    var watcher = lazypipe().pipe(watch, globs);
    stream = stream.pipe(watcher());
  }
  return stream;
}

/**
 * Runs the linter on the given stream using the given options.
 * @param {!string} path
 * @param {!ReadableStream} stream
 * @param {!object} options
 * @return {boolean}
 */
function runLinter(path, stream, options) {
  var errorsFound = false;
  return stream.pipe(eslint(options))
    .pipe(eslint.formatEach('stylish', function(msg) {
      errorsFound = true;
      util.log(util.colors.red(msg));
    }))
    .pipe(gulpIf(isFixed, gulp.dest(path)))
    .pipe(eslint.failAfterError())
    .on('error', function() {
      if (errorsFound && !options.fix) {
        if (process.env.TRAVIS) {
          util.log(util.colors.yellow('NOTE:'),
              'The linter is currently running in warning mode.',
              'The errors found above must eventually be fixed.');
        } else {
          util.log(util.colors.yellow('NOTE:'),
              'You can use', util.colors.cyan('--fix'), 'with your',
              util.colors.cyan('gulp lint'),
              'command to automatically fix some of these lint errors.');
          util.log(util.colors.yellow('WARNING:'),
              'Since this is a destructive operation (operates on the file',
              'system), make sure you commit before running the command.');
        }
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
    buildSystemOptions.fix = true;
  }
  if (argv.build_system) {
    var stream =
        initializeStream(getBuildSystemFiles(), { base: 'build-system' });
    return runLinter('./build-system/', stream, buildSystemOptions);
  } else {
    var stream = initializeStream(config.lintGlobs, {});
    return runLinter('.', stream, options);
  }
}


gulp.task('lint', 'Validates against Google Closure Linter', lint,
{
  options: {
    'build_system': '  Runs the linter against the build system directory',
    'watch': '  Watches for changes in files, validates against the linter',
    'fix': '  Fixes simple lint errors (spacing etc).'
  }
});
