('use strict');

const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const {build: buildBinary} = require('../build');
const {createCtrlcHandler} = require('../../common/ctrlcHandler');
const {cyan} = require('kleur/colors');
const {defaultTask: runAmpDevBuildServer} = require('../default-task');
const {exec, execScriptAsync} = require('../../common/exec');
const {isCiBuild} = require('../../common/ci');
const {log} = require('../../common/logging');

/** @type {Object<StorybookEnv, number>} */
const ENV_PORTS = {
  amp: 9001,
  preact: 9002,
  react: 9003,
};

const repoDir = path.join(__dirname, '../../..');

/** @typedef {'amp'|'preact'|'react'} StorybookEnv */

/**
 * @param {StorybookEnv} env
 * @return {string}
 */
const envConfigDir = (env) => path.join(__dirname, `${env}-env`);

/**
 * @param {StorybookEnv} env
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
  ).on('error', (err) => {
    throw new Error(`Launch failed: ${err}`);
  });
}

/**
 * @param {StorybookEnv} env
 */
function buildEnv(env) {
  const configDir = envConfigDir(env);

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
async function storybookReact() {
  // React dist needs to be compiled before running
  await buildBinary();

  const {build = false, 'storybook_env': env = 'react'} = argv;
  const envs = env.split(',');
  if (build) {
    envs.forEach(buildEnv);
    return;
  }

  if (envs.includes('amp')) {
    await runAmpDevBuildServer();
  }
  createCtrlcHandler('storybook-react');
  envs.forEach(launchEnv);
}

module.exports = {
  'storybook-react': storybookReact,
};

storybookReact.description =
  'Set up isolated development and testing for React Bento components';

storybookReact.flags = {
  'build': 'Build a static web application (see https://storybook.js.org/docs)',
  'storybook_env': 'Environment(s) to run Storybook for react',
  'storybook_port': 'Port from which to run the Storybook dashboard',
};
