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
const path = require('path');
const {createCtrlcHandler} = require('../../common/ctrlcHandler');
const {defaultTask: runAmpDevBuildServer} = require('../default-task');
const {execScriptAsync} = require('../../common/exec');
const {getBaseUrl} = require('../pr-deploy-bot-utils');
const {installPackages} = require('../../common/utils');
const {isTravisPullRequestBuild} = require('../../common/travis');
const {writeFileSync} = require('fs-extra');

const ENV_PORTS = {
  amp: 9001,
  preact: 9002,
};

const repoDir = path.join(__dirname, '../../..');

/**
 * @param {string} env 'amp' or 'preact'
 * @return {string}
 */
const envConfigDir = (env) => path.join(__dirname, `${env}-env`);

/**
 * @param {string} bin
 * @param {...string} args
 * @return {!ChildProcess}
 */
const execLocalNodeBinAsync = (bin, ...args) =>
  execScriptAsync(`./node_modules/.bin/${bin} ${args.join(' ')}`, {
    stdio: [null, process.stdout, process.stderr],
    cwd: __dirname,
    env: process.env,
  });

/**
 * @param {string} env 'amp' or 'preact'
 * @return {!ChildProcess}
 */
function launchEnv(env) {
  const {ci, 'storybook_port': storybookPort = ENV_PORTS[env]} = argv;
  return execLocalNodeBinAsync(
    'start-storybook',
    `--config-dir ${envConfigDir(env)}`,
    '--quiet',
    `--static-dir ${repoDir}/`,
    `--port ${storybookPort}`,
    ci ? '--ci' : ''
  );
}

/**
 * @param {string} env 'amp' or 'preact'
 * @return {?ChildProcess}
 */
function buildEnv(env) {
  const configDir = envConfigDir(env);

  if (env === 'amp' && isTravisPullRequestBuild()) {
    // Allows PR deploys to reference built binaries.
    writeFileSync(
      `${configDir}/preview.js`,
      // If you change this JS template, make sure to JSON.stringify every
      // dynamic value. This prevents XSS and other types of garbling.
      `// DO NOT${' '}SUBMIT.
       // This preview.js file was generated for a specific PR build.
       import {addParameters} from '@storybook/preact';
       addParameters(${JSON.stringify({
         ampBaseUrlOptions: [`${getBaseUrl()}/dist`],
       })});`
    );
  }

  return execLocalNodeBinAsync(
    'build-storybook',
    `--config-dir ${configDir}`,
    `--output-dir ${repoDir}/examples/storybook/${env}`
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
