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
const {cyan} = require('kleur/colors');
const {defaultTask: runAmpDevBuildServer} = require('../default-task');
const {exec, execScriptAsync} = require('../../common/exec');
const {getBaseUrl} = require('../pr-deploy-bot-utils');
const {isCiBuild} = require('../../common/ci');
const {isPullRequestBuild} = require('../../common/ci');
const {log} = require('../../common/logging');
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
 * @param {string} env 'amp' or 'preact'
 */
function launchEnv(env) {
  log(`Launching storybook for the ${cyan(env)} environment...`);
  const {'storybook_port': port = ENV_PORTS[env]} = argv;
  execScriptAsync(
    [
      './node_modules/.bin/start-storybook',
      `--config-dir ${envConfigDir(env)}`,
      `--static-dir ${repoDir}/`,
      `--port ${port}`,
      '--quiet',
      isCiBuild() ? '--ci' : '',
    ].join(' '),
    {cwd: __dirname, stdio: 'inherit'}
  ).on('error', () => {
    throw new Error('Launch failed');
  });
}

/**
 * @param {string} env 'amp' or 'preact'
 */
function buildEnv(env) {
  const configDir = envConfigDir(env);

  if (env === 'amp' && isPullRequestBuild()) {
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
  log(`Building storybook for the ${cyan(env)} environment...`);
  const result = exec(
    [
      './node_modules/.bin/build-storybook',
      `--config-dir ${configDir}`,
      `--output-dir ${repoDir}/examples/storybook/${env}`,
      '--quiet',
      `--loglevel ${isCiBuild() ? 'warn' : 'info'}`,
    ].join(' '),
    {cwd: __dirname, stdio: 'inherit'}
  );
  if (result.status != 0) {
    throw new Error('Build failed');
  }
}

/**
 * @return {Promise<void>}
 */
async function storybook() {
  const {'storybook_env': env = 'amp,preact', build = false} = argv;
  const envs = env.split(',');
  if (!build && envs.includes('amp')) {
    await runAmpDevBuildServer();
  }
  if (!build) {
    createCtrlcHandler('storybook');
  }
  envs.map(build ? buildEnv : launchEnv);
}

module.exports = {
  storybook,
};

storybook.description = 'Isolated testing and development for AMP components.';

storybook.flags = {
  'build':
    'Builds a static web application, as described in https://storybook.js.org/docs/react/workflows/publish-storybook',
  'storybook_env':
    "Set environment(s) to run Storybook, either 'amp', 'preact' or a list as 'amp,preact'",
  'storybook_port': 'Set port from which to run the Storybook dashboard.',
};
