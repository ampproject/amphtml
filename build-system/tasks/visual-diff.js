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

var gulp = require('gulp-help')(require('gulp'));
var util = require('gulp-util');


/**
 * Run visual diff tests
 *
 * @param {function} done callback
 */
function visualDiff() {
  util.log(util.colors.yellow('Running visual diff tests...'));
}


gulp.task('visual-diff', 'Runs Visual diff tests.', visualDiff);
