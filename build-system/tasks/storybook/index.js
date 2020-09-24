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

const argv = require('minimist')(process.argv.slice(2));
const log = require('fancy-log');
const {createCtrlcHandler} = require('../../common/ctrlcHandler');
const {createServer} = require('net');
const {cyan, yellow} = require('ansi-colors');
const {DEFAULT_PORT: AMP_BUILD_PORT} = require('../serve');
const {defaultTask} = require('../default-task');
const {execScriptAsync} = require('../../common/exec');
const {installPackages} = require('../../common/utils');

const MODE_PORTS = {
  amp: 9001,
  preact: 9002,
};

function runStorybook(mode) {
  // install storybook-specific modules
  installPackages(__dirname);

  const {ci, 'storybook_port': port = MODE_PORTS[mode]} = argv;

  execScriptAsync(
    `./node_modules/.bin/start-storybook --quiet -c ./${mode}-env -p ${port} ${
      ci ? '--ci' : ''
    }`,
    {
      'stdio': [null, process.stdout, process.stderr],
      cwd: __dirname,
      env: process.env,
    }
  );
}

/**
 * @param {boolean} port
 * @return {!Promise<boolean>}
 */
const isPortInUse = (port) =>
  new Promise((resolve) => {
    const server = createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      }
    });
    server.once('listening', function () {
      resolve(false);
      server.close();
    });
    server.listen(port);
  });

/**
 * Simple wrapper around the storybook start script
 * for AMP components (HTML Environment)
 */
async function storybookAmp() {
  await runAmpServer();
  createCtrlcHandler('storybook-amp');
  runStorybook('amp' /* mode */);
}

async function runAmpServer() {
  const {port = AMP_BUILD_PORT} = argv;

  if (await isPortInUse(port)) {
    const warningDelaySecs = 5;
    log(
      yellow(`WARNING: --port=${cyan(port)}`),
      yellow('taken, make sure you either:')
    );
    log('A. serve localhost AMP binaries (gulp) in the background, or');
    log('B. select CDN as Source on the Storybook AMP Panel');
    log(
      yellow('⤷ Continuing storybook-amp in'),
      cyan(warningDelaySecs),
      yellow('seconds...')
    );
    log(yellow('⤷ Press'), cyan('Ctrl + C'), yellow('to abort...'));
    return new Promise((resolve) =>
      setTimeout(() => resolve, warningDelaySecs * 1000)
    );
  }

  await defaultTask();
}

/**
 * Simple wrapper around the storybook start script.
 */
function storybookPreact() {
  runStorybook('preact' /* mode */);
}

module.exports = {
  storybookAmp,
  storybookPreact,
};

storybookPreact.description =
  'Isolated testing and development for AMP Bento components in Preact mode.';
storybookAmp.description =
  'Isolated testing and development for AMPHTML components.';

storybookPreact.flags = storybookAmp.flags = {
  'storybook_port':
    '  Change the port that the storybook dashboard is served from',
  'ci': "  CI mode (skip interactive prompts, don't open browser)",
};
