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

const exec = require('../exec').exec;
const getStderr = require('../exec').getStderr;
const gulp = require('gulp-help')(require('gulp'));
const util = require('gulp-util');


/**
 * Wrapper around yarn check
 */
function yarnCheck(done) {
  const integrityCmd = 'yarn check --integrity';
  if (getStderr(integrityCmd).trim() != '') {
    util.log(util.colors.red('ERROR:'), 'The packages in your local',
        util.colors.cyan('node_modules'), 'are out of date. Run',
        util.colors.cyan('yarn'), 'to update them.');
    const verifyTreeCmd = 'yarn check --verify-tree';
    exec(verifyTreeCmd);
    done('Packages in node_modules are out of date. Run "yarn" to update.');
  } else {
    util.log(util.colors.green('All packages in your local',
        util.colors.cyan('node_modules'), 'are up to date.'));
    done();
  }
}

gulp.task(
    'yarn-check',
    'Performs a yarn check to make sure the local node_modules is up to date.',
    yarnCheck
);
