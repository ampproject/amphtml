#!/usr/bin/env node
/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Installs the amp task runner. If possible, installs a redirect
 * from gulp to the amp task runner.
 */

const fs = require('fs-extra');
const path = require('path');
const {cyan, green, yellow} = require('kleur/colors');
const {isCiBuild} = require('./ci');
const {logWithoutTimestamp} = require('./logging');
const {printGulpDeprecationNotice} = require('../tasks/amp-task-runner');
const {spawnProcess, getStdout} = require('./process');

const npmBinDir = getStdout('npm bin --global').trim();

/**
 * Installs the `amp` task runner to the npm bin directory if it hasn't already
 * been installed.
 */
async function installAmpRunner() {
  const ampBinary = path.join(npmBinDir, 'amp');
  const isAmpInstalled = await fs.pathExists(ampBinary);
  if (isAmpInstalled) {
    logWithoutTimestamp(green('Detected'), cyan('amp'), green('task runner.'));
  } else {
    printGulpDeprecationNotice(/* withTimeStamps */ false);
    logWithoutTimestamp(
      yellow('Installing'),
      cyan('amp'),
      yellow('task runner...')
    );
    spawnProcess('npm install --global --ignore-scripts', {'stdio': 'inherit'});
    logWithoutTimestamp(
      green('Installed'),
      cyan('amp'),
      green('task runner.\n')
    );
  }
}

/**
 * Prints a warning when a globally installed `gulp-cli` or `gulp` is detected.
 * @param {string} globalGulp
 */
function printGlobalGulpWarning(globalGulp) {
  logWithoutTimestamp(
    yellow('\nWARNING:'),
    'Cannot install fallback',
    cyan('gulp'),
    'task runner due to the presence of a global',
    cyan(globalGulp) + '.'
  );
  logWithoutTimestamp(
    '⤷ Uninstall it by running',
    cyan(`npm uninstall --global ${globalGulp}`),
    'and then rerun',
    cyan('npm install') + '.'
  );
  logWithoutTimestamp(
    '⤷ Alternatively, switch to the',
    cyan('amp'),
    'task runner for AMPHTML development.'
  );
  logWithoutTimestamp('⤷ Run', cyan('amp --help'), 'for more info.\n');
}

/**
 * Looks for a global `gulp-cli` and prints a warning if found. If not, installs
 * a fallback `gulp` task runner to the npm bin directory if it hasn't already
 * been installed so that `gulp` commands do not abruptly stop working.
 * TODO(amphtml): Remove this function after a month or so.
 */
async function installGulpRunner() {
  const gulpBinary = path.join(npmBinDir, 'gulp');
  const isGulpInstalled = await fs.pathExists(gulpBinary);
  if (isGulpInstalled) {
    const gulpTarget = await fs.readlink(gulpBinary);
    if (gulpTarget.includes('gulp-deprecated')) {
      logWithoutTimestamp(
        green('Detected fallback'),
        cyan('gulp'),
        green('task runner.\n')
      );
    } else {
      const globalGulp = gulpTarget.includes('gulp-cli') ? 'gulp-cli' : 'gulp';
      printGlobalGulpWarning(globalGulp);
    }
  } else {
    logWithoutTimestamp(
      yellow('Installing fallback'),
      cyan('gulp'),
      yellow('task runner...')
    );
    const gulpRunner = path.resolve(process.cwd(), 'gulp-deprecated.js');
    try {
      await fs.ensureSymlink(gulpRunner, gulpBinary);
      logWithoutTimestamp(
        green('Installed fallback'),
        cyan('gulp'),
        green('task runner.\n')
      );
    } catch (err) {
      logWithoutTimestamp(
        yellow('WARNING: Could not create fallback'),
        cyan('gulp'),
        yellow('task runner.\n')
      );
    }
  }
}

async function installTaskRunner() {
  await installAmpRunner();
  if (!isCiBuild()) {
    await installGulpRunner();
  }
}

installTaskRunner();
