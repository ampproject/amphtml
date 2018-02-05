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
const exec = require('../exec').exec;
const getStderr = require('../exec').getStderr;
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');


/**
 * Does a yarn check on node_modules, and if it is outdated, runs yarn.
 */
function updatePackages() {
  const integrityCmd = 'yarn check --integrity';
  if (getStderr(integrityCmd).trim() != '') {
    log(colors.yellow('WARNING:'), 'The packages in',
        colors.cyan('node_modules'), 'do not match',
        colors.cyan('package.json.'));
    const verifyTreeCmd = 'yarn check --verify-tree';
    exec(verifyTreeCmd);
    log('Running', colors.cyan('yarn'), 'to update packages...');
    const yarnCmd = 'yarn';
    exec(yarnCmd);
  } else {
    if (!process.env.TRAVIS) {
      log(colors.green('All packages in'),
          colors.cyan('node_modules'), colors.green('are up to date.'));
    }
  }
}

gulp.task(
    'update-packages',
    'Runs yarn if node_modules is not up to date.',
    updatePackages
);
