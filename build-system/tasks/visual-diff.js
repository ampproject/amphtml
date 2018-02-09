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

const argv = require('minimist')(process.argv.slice(2));
const execOrDie = require('../exec').execOrDie;
const getStdout = require('../exec').getStdout;
const gulp = require('gulp-help')(require('gulp'));


/**
 * Disambiguates branch names by decorating them with the commit author name.
 * We do this for all non-push builds in order to prevent them from being used
 * as baselines for future builds.
 */
function setPercyBranch() {
  if (!argv.master || !process.env['TRAVIS']) {
    const userName = getStdout(
        'git log -1 --pretty=format:"%ae"').trim();
    const branchName = process.env['TRAVIS'] ?
      process.env['TRAVIS_PULL_REQUEST_BRANCH'] :
      getStdout('git rev-parse --abbrev-ref HEAD').trim();
    process.env['PERCY_BRANCH'] = userName + '-' + branchName;
  }
}

/**
 * Simple wrapper around the ruby based visual diff tests.
 */
function visualDiff() {
  setPercyBranch();
  let cmd = 'ruby build-system/tasks/visual-diff.rb';
  for (const arg in argv) {
    if (arg !== '_') {
      cmd = cmd + ' --' + arg;
    }
  }
  execOrDie(cmd);
}

gulp.task(
    'visual-diff',
    'Runs the AMP visual diff tests.',
    visualDiff,
    {
      options: {
        'master': '  Includes a blank snapshot (baseline for skipped builds)',
        'verify': '  Verifies the status of the build ID in ./PERCY_BUILD_ID',
        'skip': '  Creates a dummy Percy build with only a blank snapshot',
        'headless': '  Runs Chrome in headless mode',
        'percy_debug': '  Prints debug info from Percy libraries',
        'webserver_debug': '  Prints debug info from the local gulp webserver',
        'debug': '  Prints all the above debug info',
      },
    }
);
