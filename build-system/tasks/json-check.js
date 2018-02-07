/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const colors = require('ansi-colors');
const gulp = require('gulp-help')(require('gulp'));
const jsonGlobs = require('../config').jsonGlobs;
const log = require('fancy-log');
const through2 = require('through2');

/**
 * Fail if JSON files are valid.
 */
function checkValidJson() {
  let hasError = false;
  return gulp.src(jsonGlobs)
      .pipe(through2.obj(function(file) {
        try {
          JSON.parse(file.contents.toString());
        } catch (e) {
          log(colors.red('Invalid JSON in '
              + file.relative + ': ' + e.message));
          hasError = true;
        }
      }))
      .on('end', function() {
        if (hasError) {
          process.exit(1);
        }
      });
}

gulp.task(
    'json-syntax', 'Check that JSON files are valid JSON.', checkValidJson);
