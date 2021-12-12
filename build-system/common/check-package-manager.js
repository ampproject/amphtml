#!/usr/bin/env node

'use strict';

/**
 * @fileoverview Perform checks on the AMP toolchain.
 */

/*
 * NOTE: DO NOT use non-native node modules in this file.
 *       This file runs before installing any packages,
 *       so it must work with vanilla NodeJS code.
 * github.com/ampproject/amphtml/pull/19386
 */
const https = require('https');
const {getStdout} = require('./process');

const setupInstructionsUrl =
  'https://github.com/ampproject/amphtml/blob/main/docs/getting-started-quick.md#one-time-setup';
const nodeDistributionsUrl = 'https://nodejs.org/dist/index.json';

const warningDelaySecs = 10;

const updatesNeeded = new Set();

const npmInfoMessage = `${red(
  '*** The AMP project now uses npm for package management ***'
)}
For more info, see ${cyan('http://go.amp.dev/issue/30518')}.

${yellow('To install all packages:')}
${cyan('$')} npm install

${yellow('To install a new (runtime) package to "dependencies":')}
${cyan('$')} npm install [package_name@version]

${yellow('To install a new (toolset) package to "devDependencies":')}
${cyan('$')} npm install --save-dev [package_name@version]

${yellow('To update a package:')}
${cyan('$')} npm update [package_name@version]

${yellow('To uninstall a package:')}
${cyan('$')} npm uninstall [package_name]

${yellow('For detailed instructions, see')} ${cyan(setupInstructionsUrl)}`;

// Color formatting libraries may not be available when this script is run.
/**
 * Formats the text to appear red
 *
 * @param {*} text
 * @return {string}
 */
function red(text) {
  return '\x1b[31m' + text + '\x1b[0m';
}
/**
 * Formats the text to appear cyan
 *
 * @param {*} text
 * @return {string}
 */
function cyan(text) {
  return '\x1b[36m' + text + '\x1b[0m';
}
/**
 * Formats the text to appear green
 *
 * @param {*} text
 * @return {string}
 */
function green(text) {
  return '\x1b[32m' + text + '\x1b[0m';
}
/**
 * Formats the text to appear yellow
 *
 * @param {*} text
 * @return {string}
 */
function yellow(text) {
  return '\x1b[33m' + text + '\x1b[0m';
}

/**
 * If yarn is being run, print a message and cause 'yarn install' to fail.
 * See https://github.com/yarnpkg/yarn/issues/5063 for details on how the
 * package manager being used is determined.
 **/
function ensureNpm() {
  if (!process.env.npm_execpath?.includes('npm')) {
    console.log(npmInfoMessage);
    process.exit(1);
  }
}

/**
 * Check the node version and print a warning if it is not the latest LTS.
 *
 * @return {Promise<void>}
 **/
function checkNodeVersion() {
  const nodeVersion = getStdout('node --version').trim();
  return new Promise((resolve) => {
    https
      .get(nodeDistributionsUrl, (res) => {
        res.setEncoding('utf8');
        let distributions = '';
        res.on('data', (data) => {
          distributions += data;
        });
        res.on('end', () => {
          const distributionsJson = JSON.parse(distributions);
          const latestLtsVersion = getNodeLatestLtsVersion(distributionsJson);
          if (latestLtsVersion === '') {
            console.log(
              yellow(
                'WARNING: Something went wrong. ' +
                  'Could not determine the latest LTS version of node.'
              )
            );
          } else if (nodeVersion !== latestLtsVersion) {
            console.log(
              yellow('WARNING: Detected node version'),
              cyan(nodeVersion) +
                yellow('. Recommended (latest LTS) version is'),
              cyan(latestLtsVersion) + yellow('.')
            );
            console.log(
              yellow('⤷ To fix this, run'),
              cyan('"nvm install --lts"'),
              yellow('or see'),
              cyan('https://nodejs.org/en/download/package-manager'),
              yellow('for instructions.')
            );
            updatesNeeded.add('node');
          } else {
            console.log(
              green('Detected'),
              cyan('node'),
              green('version'),
              cyan(nodeVersion + ' (latest LTS)') + green('.')
            );
          }
          resolve();
        });
      })
      .on('error', () => {
        console.log(
          yellow(
            'WARNING: Something went wrong. ' +
              'Could not download node version info from ' +
              cyan(nodeDistributionsUrl) +
              yellow('.')
          )
        );
        console.log(
          yellow('⤷ Detected node version'),
          cyan(nodeVersion) + yellow('.')
        );
        resolve();
      });
  });
}

/**
 * Extracts the latest node version from a JSON object containing version info
 *
 * @param {!Object} distributionsJson
 * @return {string}
 */
function getNodeLatestLtsVersion(distributionsJson) {
  if (distributionsJson) {
    // Versions are in descending order, so the first match is the latest lts.
    return distributionsJson.find(function (distribution) {
      return (
        distribution.hasOwnProperty('version') &&
        distribution.hasOwnProperty('lts') &&
        distribution.lts
      );
    }).version;
  } else {
    return '';
  }
}

/**
 * If npm is being run, log its version and proceed with the install.
 */
function logNpmVersion() {
  const npmVersion = getStdout('npm --version').trim();
  console.log(
    green('Detected'),
    cyan('npm'),
    green('version'),
    cyan(npmVersion) + green('. Installing packages...')
  );
}

/**
 * Checks if the local version of python is 2.7 or 3
 */
function checkPythonVersion() {
  // Python 2.7 is EOL but still supported
  // Python 3.6+ are still supported
  // https://devguide.python.org/#status-of-python-branches
  const recommendedVersion = '2.7 or 3.6+';
  const recommendedVersionRegex = /^2\.7|^3\.(?:[6-9]|1\d)/;

  // Python2 prints its version to stderr (fixed in Python 3.4)
  // See: https://bugs.python.org/issue18338
  const pythonVersionResult = getStdout('python --version 2>&1').trim();
  const pythonVersion = pythonVersionResult.match(/Python (.*?)$/);
  if (pythonVersion && pythonVersion.length == 2) {
    const versionNumber = pythonVersion[1];
    if (recommendedVersionRegex.test(versionNumber)) {
      console.log(
        green('Detected'),
        cyan('python'),
        green('version'),
        cyan(versionNumber) + green('.')
      );
    } else {
      console.log(
        yellow('WARNING: Detected python version'),
        cyan(versionNumber) +
          yellow('. Recommended version for AMP development is'),
        cyan(recommendedVersion) + yellow('.')
      );
      console.log(
        yellow('⤷ To fix this, install a supported version from'),
        cyan('https://www.python.org/downloads/') + yellow('.')
      );
    }
  } else {
    console.log(
      yellow('WARNING: Could not determine the local version of python.')
    );
    console.log(
      yellow('⤷ To fix this, make sure'),
      cyan('python'),
      yellow('is in your'),
      cyan('PATH'),
      yellow('and is version'),
      cyan(recommendedVersion) + yellow('.')
    );
  }
}

/**
 * Runs checks for the package manager and tooling being used.
 * @return {Promise}
 */
async function main() {
  ensureNpm();
  await checkNodeVersion();
  checkPythonVersion();
  logNpmVersion();
  if (updatesNeeded.size) {
    console.log(
      yellow('\nWARNING: Detected problems with'),
      cyan(Array.from(updatesNeeded).join(', '))
    );
    if (process.env.CI) {
      console.log(
        yellow('Skipping delay prompt for'),
        cyan('CI'),
        yellow('environment.')
      );
      return;
    }
    console.log(
      yellow('⤷ Continuing install in'),
      cyan(warningDelaySecs),
      yellow('seconds...')
    );
    console.log(
      yellow('⤷ Press'),
      cyan('Ctrl + C'),
      yellow('to abort and fix...')
    );
    let resolver;
    const deferred = new Promise((resolverIn) => {
      resolver = resolverIn;
    });
    setTimeout(() => {
      console.log(yellow('\nAttempting to install packages...'));
      resolver();
    }, warningDelaySecs * 1000);
    return deferred;
  }
}

main();
