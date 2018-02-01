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
 * Does a yarn check on node_modules, and if it is outdated, runs yarn.
 */
function updatePackages() {
  const integrityCmd = 'yarn check --integrity';
  if (getStderr(integrityCmd).trim() != '') {
    util.log(util.colors.yellow('WARNING:'), 'The packages in',
        util.colors.cyan('node_modules'), 'do not match',
        util.colors.cyan('package.json.'));
    const verifyTreeCmd = 'yarn check --verify-tree';
    exec(verifyTreeCmd);
    util.log('Running', util.colors.cyan('yarn'), 'to update packages...');
    const yarnCmd = 'yarn';
    exec(yarnCmd);
  } else {
    if (!process.env.TRAVIS) {
      util.log(util.colors.green('All packages in',
          util.colors.cyan('node_modules'), 'are up to date.'));
    }
  }
}

gulp.task(
    'update-packages',
    'Runs yarn if node_modules is not up to date.',
    updatePackages
);
