#!/usr/bin/env node

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
 * @return {Promise<void>}
 */
async function installAmpTaskRunner() {
  const npmBinDir = getStdout('npm prefix --global').trim();
  const ampBinary = path.join(npmBinDir, 'bin', 'amp');
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
