/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const log = require('fancy-log');
const {red, cyan} = require('ansi-colors');

/**
 * @fileoverview
 * This script kicks off the unit and integration tests on Linux, Mac OS, and
 * Windows. This is run on Github Actions CI stage = Cross-Browser Tests.
 */

const {
  startTimer,
  stopTimer,
  timedExecOrDie: timedExecOrDieBase,
  timedExec: timedExecBase,
} = require('./utils');

const FILENAME = 'cross-browser-tests.js';
const timedExecOrDie = (cmd) => timedExecOrDieBase(cmd, FILENAME);
const timedExec = (cmd) => timedExecBase(cmd, FILENAME);

async function main() {
  const startTime = startTimer(FILENAME, FILENAME);
  timedExecOrDie('gulp update-packages');
  timedExecOrDie('gulp dist --fortesting');

  switch (process.platform) {
    case 'linux':
      timedExecOrDie('gulp unit --nobuild --headless --firefox');
      timedExecOrDie(
        'gulp integration --nobuild --compiled --headless --firefox'
      );
      break;
    case 'darwin':
      timedExecOrDie('gulp unit --nobuild --safari');
      timedExecOrDie('gulp integration --nobuild --compiled --safari');
      break;
    case 'win32':
      timedExecOrDie('gulp unit --nobuild --headless --edge');
      timedExecOrDie('gulp integration --nobuild --compiled --headless --edge');
      timedExecOrDie('gulp integration --nobuild --compiled --ie');
      break;
    default:
      log(
        red('ERROR:'),
        'Cannot run cross-browser tests on',
        cyan(process.platform) + '.'
      );
  }
  stopTimer(FILENAME, FILENAME, startTime);
}

main();
