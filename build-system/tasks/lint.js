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
var gjslint = require('gulp-gjslint');

// Directories to check for presubmit checks.
var srcGlobs = [
  '**/*.{css,js,html,md}',
  '!{node_modules,build,dist,dist.ads}/**/*.*',
];

var options = {
  flags: [
      '--max_line_length 100',
      '--custom_jsdoc_tags=visibleForTesting',
      '--limited_doc_files=test-*.js',
  ]
};

function lint() {
  return gulp.src(srcGlobs)
    .pipe(gjslint(options))
    .pipe(gjslint.reporter('console'), {fail: true});
}

gulp.task('lint', lint);
