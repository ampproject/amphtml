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
       export const parameters = (${JSON.stringify({
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
  const {build = false, 'storybook_env': env = 'amp,preact'} = argv;
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
    "Environment(s) to run Storybook (either 'amp', 'preact' or a list as 'amp,preact')",
  'storybook_port': 'Port from which to run the Storybook dashboard',
};
