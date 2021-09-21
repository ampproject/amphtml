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
  const npmBinDir = getStdout('npm bin --global').trim();
  const ampBinary = path.join(npmBinDir, 'amp');

  log(yellow('Installing'), cyan('amp'), yellow('task runner...'));
  await fs.copy(ampCliRunner, ampBinary, {overwrite: true});
  log(green('Installed'), cyan('amp'), green('task runner.\n'));

  log(
    yellow('Auto-complete is available for the'),
    cyan('amp'),
    yellow('command:')
  );
  if (process.env.SHELL?.includes('bash') && process.platform === 'darwin') {
    log(
      '⤷ Run',
      cyan('brew install bash-completion'),
      'to install auto-complete support for Bash on MacOS'
    );
  }
  log(
    '⤷ Run',
    cyan('amp --setup-auto-complete'),
    'to enable shell auto-complete\n'
  );
}

installAmpTaskRunner();
