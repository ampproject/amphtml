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
const gulp = require('gulp-help')(require('gulp'));
const {execOrDie} = require('../exec');

let validatorArgs = '';
if (argv.update_tests) {
  validatorArgs += ' --update_tests';
}

/**
 * Simple wrapper around the python based validator build.
 */
function validator() {
  execOrDie('cd validator && python build.py' + validatorArgs);
}

/**
 * Simple wrapper around the python based validator webui build.
 */
function validatorWebui() {
  execOrDie('cd validator/webui && python build.py' + validatorArgs);
}

gulp.task('validator', 'Builds and tests the AMP validator.', validator);
gulp.task('validator-webui', 'Builds and tests the AMP validator web UI.',
    validatorWebui);
