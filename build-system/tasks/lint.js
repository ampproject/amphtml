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


var gulp = require('gulp');
var eslint = require('gulp-eslint');
var util = require('gulp-util');
var config = require('../config');

var options = {
  plugins: ['eslint-plugin-google-camelcase'],
};

function lint() {
  var errorsFound = false;
  return gulp.src(['**/*.js', config.src.exclude])
      .pipe(eslint(options))
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

gulp.task('lint', lint);
