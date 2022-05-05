'use strict';

const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const {createCtrlcHandler} = require('../../common/ctrlcHandler');
const {cyan} = require('kleur/colors');
const {defaultTask: runAmpDevBuildServer} = require('../default-task');
const {exec, execScriptAsync} = require('../../common/exec');
const {isCiBuild} = require('../../common/ci');
const {log} = require('../../common/logging');
const {updateSubpackages} = require('../../common/update-packages');
const {bootstrapThirdPartyFrames} = require('../helpers');

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
const envDir = (env) => path.join(__dirname, 'env', env);

/**
 * @param {StorybookEnv} env
 */
function startStorybook(env) {
  const {'storybook_port': port = ENV_PORTS[env]} = argv;
  log(`Launching storybook for the ${cyan(env)} environment...`);
  execScriptAsync(
    [
      'npx',
      'start-storybook',
      `--config-dir .`,
      `--port ${port}`,
      '--quiet',
      isCiBuild() ? '--ci' : '',
    ].join(' '),
    {cwd: envDir(env), stdio: 'inherit'}
  ).on('error', () => {
    throw new Error('Launch failed');
  });
}

/**
 * @param {StorybookEnv} env
 */
function buildStorybook(env) {
  log(`Building storybook for the ${cyan(env)} environment...`);

  const result = exec(
    [
      'npx',
      'build-storybook',
      `--config-dir .`,
      `--output-dir ${repoDir}/examples/storybook/${env}`,
      '--quiet',
      `--loglevel ${isCiBuild() ? 'warn' : 'info'}`,
    ].join(' '),
    {cwd: envDir(env), stdio: 'inherit'}
  );
  if (result.status != 0) {
    throw new Error('Build failed');
  }
}

/**
 * @param {string} env
 * @return {StorybookEnv[]}
 */
function parseEnvs(env) {
  return /** @type {StorybookEnv[]} */ (
    env.split(',').filter((env) => {
      return env === 'amp' || env === 'preact' || env === 'react';
    })
  );
}

/**
 * @return {Promise<void>}
 */
async function storybook() {
  const {build = false, 'storybook_env': storybookEnv = 'preact'} = argv;
  const envs = parseEnvs(storybookEnv);
  if (!build) {
    createCtrlcHandler('storybook');
    if (envs.includes('amp')) {
      await runAmpDevBuildServer();
    } else {
      // Proxy frames require an .html file output from the function below.
      // runAmpDevBuildServer() does this implicitly, so it's not required to
      // call directly in that case.
      await bootstrapThirdPartyFrames({});
    }
  }
  for (const env of envs) {
    updateSubpackages(envDir(env));
    if (build) {
      buildStorybook(env);
    } else {
      startStorybook(env);
    }
  }
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
