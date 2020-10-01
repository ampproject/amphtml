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
function launchEnv(env) {
  const {ci, 'storybook_port': storybookPort = ENV_PORTS[env]} = argv;
  return execScriptAsync(
    [
      './node_modules/.bin/start-storybook',
      '--quiet',
      `-c ./${env}-env`,
      `-p ${storybookPort}`,
      ci ? '--ci' : '',
    ].join(' '),
    {
      stdio: [null, process.stdout, process.stderr],
      cwd: __dirname,
      env: process.env,
    }
  );
}

async function storybook() {
  const {'storybook_env': env = 'amp,preact'} = argv;
  const envs = env.split(',');
  if (envs.includes('amp')) {
    await runAmpDevBuildServer();
  }
  installPackages(__dirname);
  createCtrlcHandler('storybook');
  return Promise.all(envs.map(launchEnv));
}

module.exports = {
  storybook,
};

storybook.description = 'Isolated testing and development for AMP components.';

storybook.flags = {
  'storybook_env':
    "  Set environment(s) to run Storybook, either 'amp', 'preact' or a list as 'amp,preact'",
  'storybook_port': '  Set port from which to run the Storybook dashboard.',
  'ci': "  CI mode (skip interactive prompts, don't open browser)",
};
