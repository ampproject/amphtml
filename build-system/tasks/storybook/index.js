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
const {createCtrlcHandler} = require('../../common/ctrlcHandler');
const {defaultTask: runAmpDevBuildServer} = require('../default-task');
const {execScriptAsync} = require('../../common/exec');
const {installPackages} = require('../../common/utils');

const ENV_PORTS = {
  amp: 9001,
  preact: 9002,
};

/**
 * @param {string} env 'amp' or 'preact'
 * @return {!ChildProcess}
 */
function runStorybook(env) {
  // install storybook-specific modules
  installPackages(__dirname);

  const {ci, 'storybook_port': port = ENV_PORTS[env]} = argv;

  return execScriptAsync(
    `./node_modules/.bin/start-storybook --quiet -c ./${env}-env -p ${port} ${
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
 * Simple wrapper around the storybook start script
 * for AMP components (HTML Environment)
 */
async function storybookAmp() {
  await runAmpDevBuildServer();
  createCtrlcHandler('storybook-amp');
  runStorybook('amp' /* mode */);
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
