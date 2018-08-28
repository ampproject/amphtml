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

const colors = require('ansi-colors');
const fs = require('fs-extra');
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const {getStdout} = require('../exec');

const runtimeFile = './dist/v0.js';
const maxSize = '80.97KB';

const {green, red, cyan, yellow} = colors;

/**
 * Checks gzipped size of existing v0.js (amp.js) against `maxSize`.
 * Does _not_ rebuild: run `gulp dist --fortesting --noextensions` first.
 */
function checkBundleSize() {
  if (!fs.existsSync(runtimeFile)) {
    log(yellow('Could not find'), cyan(runtimeFile) +
        yellow('. Skipping bundlesize check.'));
    log(yellow('To include this check, run'),
        cyan('gulp dist --fortesting [--noextensions]'),
        yellow('before'), cyan('gulp bundle-size') + yellow('.'));
    return;
  }

  const cmd = `npx bundlesize -f "${runtimeFile}" -s "${maxSize}"`;
  log('Running ' + cyan(cmd) + '...');
  const output = getStdout(cmd);
  const pass = output.match(/PASS .*/);
  const fail = output.match(/FAIL .*/);
  const error = output.match(/ERROR .*/);
  if (error && error.length > 0) {
    log(yellow(error[0]));
  } else if (fail && fail.length > 0) {
    log(red(fail[0]));
    log(red('ERROR:'), cyan('bundlesize'), red('found that'),
        cyan(runtimeFile), red('has exceeded its size cap of'),
        cyan(maxSize) + red('.'));
    log(red(
        'This is part of a new effort to reduce AMP\'s binary size (#14392).'));
    log(red('Please contact @choumx or @jridgewell for assistance.'));
    process.exitCode = 1;
  } else if (pass && pass.length > 0) {
    log(green(pass[0]));
  } else {
    log(yellow(output));
  }
}


gulp.task(
    'bundle-size',
    'Checks if the minified AMP binary has exceeded its size cap',
    checkBundleSize);
