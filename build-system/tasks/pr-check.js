/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
const gulp = require('gulp-help')(require('gulp'));
const {execOrDie} = require('../exec');


/**
 * Simple wrapper around pr-check.js.
 */
function prCheck() {
  let cmd = 'node build-system/pr-check.js';
  if (argv.files) {
    cmd = cmd + ' --files ' + argv.files;
  }
  if (argv.nobuild) {
    cmd = cmd + ' --nobuild';
  }
  execOrDie(cmd);
}

gulp.task(
    'pr-check',
    'Locally runs the PR checks that are run by Travis CI.',
    prCheck,
    {
      options: {
        'files': '  Restricts unit / integration tests to just these files',
        'nobuild': '  Skips building the runtime via `gulp build`.',
      },
    }
);
