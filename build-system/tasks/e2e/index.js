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

'use strict';

const gulp = require('gulp-help')(require('gulp'));
const mocha = require('gulp-mocha');

function e2e() {
  return gulp.src(['test/e2e/*.js'], {read: false})
      .pipe(mocha({
        require: ['@babel/register', '../../../testing/e2e/test-module'],
      }));
}

gulp.task('e2e', 'Runs e2e tests', function() {
  return e2e();
});
