/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

const BBPromise = require('bluebird');
const argv = require('minimist')(process.argv.slice(2));
const gulp = require('gulp-help')(require('gulp'));
const git = require('gulp-git');
const gitPull = BBPromise.promisify(git.pull);

const noop = function() {};

gulp.task('pull', () => {
  const remote = argv._[1] || 'origin';
  const branch = argv._[2] || 'master';
  return gitPull(remote, branch);
});

gulp.task('origin', noop);
gulp.task('master', noop);
