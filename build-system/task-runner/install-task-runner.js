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
const {getStdout} = require('../common/process');
const {isCiBuild} = require('../common/ci');
const {logWithoutTimestamp} = require('../common/logging');
const {printGulpDeprecationNotice} = require('./amp-task-runner');

const npmBinDir = getStdout('npm bin --global').trim();

/**
 * Installs a runner to the npm bin directory and points it to the given target.
 * @param {string} runnerName
 * @param {string} runnerTarget
 */
async function installCliRunner(runnerName, runnerTarget) {
  logWithoutTimestamp(
    yellow('Installing'),
    cyan(runnerName),
    yellow('task runner...')
  );
  const runnerBinary = path.join(npmBinDir, runnerName);
  const runnerContents = (
    await fs.readFile('build-system/task-runner/cli-runner.js', 'utf-8')
  ).replace('__RUNNER_TARGET__', runnerTarget);
  await fs.remove(runnerBinary);
  await fs.outputFile(runnerBinary, runnerContents, {mode: 0o755});
  logWithoutTimestamp(
    green('Installed'),
    cyan(runnerName),
    green('task runner.\n')
  );
}

/**
 * Installs the `amp` task runner to the npm bin directory if it hasn't already
 * been installed. Ensures that the binary exists and is a node runner script.
 */
async function installAmpRunner() {
  const ampBinary = path.join(npmBinDir, 'amp');
  const ampBinaryExists = await fs.pathExists(ampBinary);
  if (ampBinaryExists) {
    const ampBinaryIsAScript = !(await fs.lstat(ampBinary)).isSymbolicLink();
    if (ampBinaryIsAScript) {
      logWithoutTimestamp(
        green('Detected'),
        cyan('amp'),
        green('task runner.')
      );
      return;
    }
  }
  printGulpDeprecationNotice(/* withTimeStamps */ false);
  await installCliRunner('amp', 'amp.js');
}

/**
 * Prints a warning when a globally installed `gulp-cli` or `gulp` is detected.
 * @param {string} globalGulp
 */
function printGlobalGulpWarning(globalGulp) {
  logWithoutTimestamp(
    yellow('\nWARNING:'),
    'Cannot install',
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
 * been installed so that `gulp` commands do not abruptly stop working. Ensures
 * that the binary exists and is a node runner script.
 * TODO(amphtml): Remove this function after a month or so.
 */
async function installGulpRunner() {
  const gulpBinary = path.join(npmBinDir, 'gulp');
  const gulpBinaryExists = await fs.pathExists(gulpBinary);
  if (gulpBinaryExists) {
    const gulpBinaryIsAScript = !(await fs.lstat(gulpBinary)).isSymbolicLink();
    if (gulpBinaryIsAScript) {
      logWithoutTimestamp(
        green('Detected'),
        cyan('gulp'),
        green('task runner.\n')
      );
      return;
    }
    const gulpTarget = await fs.readlink(gulpBinary);
    if (!gulpTarget.includes('gulp-deprecated')) {
      const globalGulp = gulpTarget.includes('gulp-cli') ? 'gulp-cli' : 'gulp';
      printGlobalGulpWarning(globalGulp);
      return;
    }
  }
  await installCliRunner('gulp', 'gulp-deprecated.js');
}

async function installTaskRunner() {
  await installAmpRunner();
  if (!isCiBuild()) {
    await installGulpRunner();
  }
}

installTaskRunner();
