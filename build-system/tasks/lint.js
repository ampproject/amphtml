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


var argv = require('minimist')(process.argv.slice(2));
var config = require('../config');
var gulp = require('gulp-help')(require('gulp'));
var eslint = require('gulp-eslint');
var lazypipe = require('lazypipe');
var util = require('gulp-util');
var watch = require('gulp-watch');

var isWatching = (argv.watch || argv.w) || false;

var options = {
  plugins: ['eslint-plugin-google-camelcase'],
};

var srcs = ['**/*.js', config.src.exclude];

var watcher = lazypipe().pipe(watch, srcs);

/**
 * Run the eslinter on the src javascript and log the output
 * @return {!Stream} Readable stream
 */
function lint() {
  var errorsFound = false;
  var stream = gulp.src(srcs);

  if (isWatching) {
    stream = stream.pipe(watcher());
  }

  return stream.pipe(eslint(options))
    .pipe(eslint.formatEach('compact', function(msg) {
      errorsFound = true;
      util.log(util.colors.red(msg));
    }))
    .on('end', function() {
      if (errorsFound) {
        process.exit(1);
      }
    });
}

gulp.task('lint', 'Validates against Google Closure Linter', lint,
    {
      options: {
        'watch': 'Watches for changes in files, validates against the linter'
      }
    });
