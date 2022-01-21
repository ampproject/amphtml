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
const {yellow} = require('kleur/colors');
const {updateSubpackages} = require('../../common/update-packages');

/** @typedef {'amp'|'preact'|'react'} StorybookEnv */

const ENV_PORTS = {
  amp: 9001,
  preact: 9002,
  react: 9003,
};

const repoDir = path.join(__dirname, '../../..');

/**
 * @param {StorybookEnv} env
 * @return {string}
 */
const envConfigDir = (env) => path.join(__dirname, 'env', env);

/**
 * @param {StorybookEnv} env
 */
function launchEnv(env) {
  if (env === 'amp') {
    log(
      yellow('AMP environment for storybook is temporarily disabled.\n') +
        'See https://github.com/ampproject/storybook-addon-amp/issues/57'
    );
    return;
  }
  const {'storybook_port': port = ENV_PORTS[env]} = argv;
  const envDir = envConfigDir(env);

  updateSubpackages(envDir);

  log(`Launching storybook for the ${cyan(env)} environment...`);

  execScriptAsync(
    [
      `./node_modules/.bin/start-storybook`,
      `--config-dir .`,
      `--port ${port}`,
      '--quiet',
      isCiBuild() ? '--ci' : '',
    ].join(' '),
    {cwd: envDir, stdio: 'inherit'}
  ).on('error', () => {
    throw new Error('Launch failed');
  });
}

/**
 * @param {StorybookEnv} env
 */
function buildEnv(env) {
  if (env === 'amp') {
    log(
      yellow('AMP environment for storybook is temporarily disabled.\n') +
        'See https://github.com/ampproject/storybook-addon-amp/issues/57'
    );
    return;
    if (env === 'amp' && isPullRequestBuild()) {
      // Allows PR deploys to reference built binaries.
      const parameters = {
        ampBaseUrlOptions: [`${getBaseUrl()}/dist`],
      };
      const previewFileContents = [
        // eslint-disable-next-line local/no-forbidden-terms
        '// DO NOT SUBMIT',
        '// This preview.js file was generated for a specific PR build.',
        // JSON.stringify here. prevents XSS and other types of garbling.
        `export const parameters = (${JSON.stringify(parameters)});`,
      ].join('\n');
      writeFileSync(`${envConfigDir(env)}/preview.js`, previewFileContents);
    }
  }

  const envDir = envConfigDir(env);

  log(`Building storybook for the ${cyan(env)} environment...`);
  const result = exec(
    [
      './node_modules/.bin/build-storybook',
      `--config-dir .`,
      `--output-dir ${repoDir}/examples/storybook/${env}`,
      '--quiet',
      `--loglevel ${isCiBuild() ? 'warn' : 'info'}`,
    ].join(' '),
    {cwd: envDir, stdio: 'inherit'}
  );
  if (result.status != 0) {
    throw new Error('Build failed');
  }
}

/**
 * @return {Promise<void>}
 */
async function storybook() {
  const {build = false, 'storybook_env': env = 'preact'} = argv;
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

storybook.description =
  'Set up isolated development and testing for AMP components';

storybook.flags = {
  'build': 'Build a static web application (see https://storybook.js.org/docs)',
  'storybook_env':
    "Environment(s) to run Storybook. Either 'amp', 'preact' or 'react', or a list as 'amp,preact'. Defaults to 'preact'",
  'storybook_port': 'Port from which to run the Storybook dashboard',
};
