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
 * @fileoverview Installs the amp task runner.
 */

const fs = require('fs-extra');
const path = require('path');
const {cyan, green, yellow} = require('kleur/colors');
const {getStdout} = require('../common/process');
const {logWithoutTimestamp: log} = require('../common/logging');

const ampCliRunner = 'build-system/task-runner/amp-cli-runner.js';

/**
 * Installs the `amp` task runner to the npm bin directory if it hasn't already
 * been installed. Ensures that the binary exists and is a node runner script.
 */
async function installAmpTaskRunner() {
  const npmBinDir = getStdout('npm bin --global').trim();
  const ampBinary = path.join(npmBinDir, 'amp');
  const ampBinaryExists = await fs.pathExists(ampBinary);
  if (ampBinaryExists) {
    const ampBinaryIsAScript = !(await fs.lstat(ampBinary)).isSymbolicLink();
    if (ampBinaryIsAScript) {
      log(green('Detected'), cyan('amp'), green('task runner.'));
      return;
    }
  }
  log(yellow('Installing'), cyan('amp'), yellow('task runner...'));
  await fs.remove(ampBinary);
  await fs.copy(ampCliRunner, ampBinary);
  log(green('Installed'), cyan('amp'), green('task runner.\n'));
}

installAmpTaskRunner();
