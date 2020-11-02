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
const {defaultTask: runAmpDevBuildServer} = require('../default-task');
const {execScriptAsync} = require('../../common/exec');
const {installPackages} = require('../../common/utils');
const {yellow} = require('ansi-colors');

const ENV_PORTS = {
  amp: 9001,
  preact: 9002,
};

/**
 * @param {string} bin
 * @param {string} env 'amp' or 'preact'
 * @param {...string} args
 * @return {!ChildProcess}
 */
const execStorybookScriptAsync = (bin, env, ...args) =>
  execScriptAsync(
    `./node_modules/.bin/${bin} --config-dir ./${env}-env ${args.join(' ')}`,
    {
      stdio: [null, process.stdout, process.stderr],
      cwd: __dirname,
      env: process.env,
    }
  );

/**
 * @param {string} env 'amp' or 'preact'
 * @return {!ChildProcess}
 */
function launchEnv(env) {
  const {ci, 'storybook_port': storybookPort = ENV_PORTS[env]} = argv;
  return execStorybookScriptAsync(
    'start-storybook',
    env,
    '--quiet',
    '--static-dir ../../../',
    `--port ${storybookPort}`,
    ci ? '--ci' : ''
  );
}

/**
 * @param {string} env 'amp' or 'preact'
 * @return {?ChildProcess}
 */
function buildEnv(env) {
  if (env === 'amp') {
    log(
      yellow(
        'WARNING: --build does not work with the `storybook/amp` environment.'
      )
    );
    return null;
  }
  log(yellow('Building `storybook/preact` only.'));
  return execStorybookScriptAsync(
    'build-storybook',
    env,
    `--output-dir ../../../examples/storybook/${env}`
  );
}

async function storybook() {
  const {'storybook_env': env = 'amp,preact', build = false} = argv;
  const envs = env.split(',');
  if (!build && envs.includes('amp')) {
    await runAmpDevBuildServer();
  }
  installPackages(__dirname);
  if (!build) {
    createCtrlcHandler('storybook');
  }
  return Promise.all(envs.map(build ? buildEnv : launchEnv));
}

module.exports = {
  storybook,
};

storybook.description = 'Isolated testing and development for AMP components.';

storybook.flags = {
  'build':
    '  Builds a static web application, as described in https://storybook.js.org/docs/react/workflows/publish-storybook',
  'storybook_env':
    "  Set environment(s) to run Storybook, either 'amp', 'preact' or a list as 'amp,preact'",
  'storybook_port': '  Set port from which to run the Storybook dashboard.',
  'ci': "  CI mode (skip interactive prompts, don't open browser)",
};
