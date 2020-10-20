/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Perform checks on the AMP toolchain.
 */

/*
 * NOTE: DO NOT use non-native node modules in this file.
 *       This file runs before installing any packages,
 *       so it must work with vanilla NodeJS code.
 * github.com/ampproject/amphtml/pull/19386
 */
const fs = require('fs');
const https = require('https');
const {getStdout} = require('./process');

const setupInstructionsUrl =
  'https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-quick.md#one-time-setup';
const nodeDistributionsUrl = 'https://nodejs.org/dist/index.json';
const gulpHelpUrl =
  'https://medium.com/gulpjs/gulp-sips-command-line-interface-e53411d4467';

const wrongGulpPaths = [
  '/bin/',
  '/sbin/',
  '/usr/bin/',
  '/usr/sbin/',
  '/usr/local/bin/',
  '/usr/local/sbin/',
];

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
function red(text) {
  return '\x1b[31m' + text + '\x1b[0m';
}
function cyan(text) {
  return '\x1b[36m' + text + '\x1b[0m';
}
function green(text) {
  return '\x1b[32m' + text + '\x1b[0m';
}
function yellow(text) {
  return '\x1b[33m' + text + '\x1b[0m';
}

/**
 * If yarn is being run, print a message and cause 'yarn install' to fail.
 * See https://github.com/yarnpkg/yarn/issues/5063 for details on how the
 * package manager being used is determined.
 **/
function ensureNpm() {
  if (!process.env.npm_execpath.includes('npm')) {
    console.log(npmInfoMessage);
    process.exit(1);
  }
}

/**
 * Check the node version and print a warning if it is not the latest LTS.
 *
 * @return {Promise}
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
 * Gets the PATH variable from the parent shell of the node process
 *
 * @return {string}
 */
function getParentShellPath() {
  const nodePath = process.env.PATH;
  const pathSeparator = process.platform == 'win32' ? ';' : ':';
  // nodejs adds a few extra variables to $PATH, ending with '../../bin/node-gyp-bin'.
  // See https://github.com/nodejs/node-convergence-archive/blob/master/deps/npm/lib/utils/lifecycle.js#L81-L85
  return nodePath.split(`node-gyp-bin${pathSeparator}`).pop();
}

/**
 * Checks for the absence of global gulp, and the presence of gulp-cli and local
 * gulp.
 */
function runGulpChecks() {
  const firstInstall = !fs.existsSync('node_modules');
  const globalPackages = getStdout('npm list --global --depth 0').trim();
  const globalGulp = globalPackages.match(/gulp@.*/);
  const globalGulpCli = globalPackages.match(/gulp-cli@.*/);
  const defaultGulpPath = getStdout('which gulp', {
    'env': {'PATH': getParentShellPath()},
  }).trim();
  const wrongGulp = wrongGulpPaths.some((path) =>
    defaultGulpPath.startsWith(path)
  );
  if (globalGulp) {
    console.log(
      yellow('WARNING: Detected a global install of'),
      cyan('gulp') + yellow('. It is recommended that you use'),
      cyan('gulp-cli'),
      yellow('instead.')
    );
    console.log(
      yellow('⤷ To fix this, run'),
      cyan('"npm uninstall --global gulp"'),
      yellow('followed by'),
      cyan('"npm install --global gulp-cli"') + yellow('.')
    );
    console.log(
      yellow('⤷ See'),
      cyan(gulpHelpUrl),
      yellow('for more information.')
    );
    updatesNeeded.add('gulp');
  } else if (!globalGulpCli) {
    console.log(
      yellow('WARNING: Could not find a global install of'),
      cyan('gulp-cli') + yellow('.')
    );
    console.log(
      yellow('⤷ To fix this, run'),
      cyan('"npm install --global gulp-cli"') + yellow('.')
    );
    updatesNeeded.add('gulp-cli');
  } else {
    printGulpVersion('gulp-cli');
  }
  if (wrongGulp) {
    console.log(
      yellow('WARNING: Found'),
      cyan('gulp'),
      yellow('in an unexpected location:'),
      cyan(defaultGulpPath) + yellow('.')
    );
    console.log(
      yellow('⤷ To fix this, consider removing'),
      cyan(defaultGulpPath),
      yellow('from your default'),
      cyan('$PATH') + yellow(', or deleting it.')
    );
    console.log(
      yellow('⤷ Run'),
      cyan('"which gulp"'),
      yellow('for more information.')
    );
    updatesNeeded.add('gulp');
  }
  if (!firstInstall) {
    printGulpVersion('gulp');
  }
}

/**
 * Prints version info for the given gulp command
 *
 * @param {string} gulpCmd
 */
function printGulpVersion(gulpCmd) {
  const versionRegex =
    gulpCmd == 'gulp' ? /Local version[:]? (.*?)$/ : /^CLI version[:]? (.*?)\n/;
  const gulpVersions = getStdout('gulp --version').trim();
  const gulpVersion = gulpVersions.match(versionRegex);
  if (gulpVersion && gulpVersion.length == 2) {
    console.log(
      green('Detected'),
      cyan(gulpCmd),
      green('version'),
      cyan(gulpVersion[1]) + green('.')
    );
  } else {
    console.log(
      yellow(`WARNING: Could not determine the version of ${gulpCmd}.`)
    );
  }
}

/**
 * Checks if the local version of python is 2.7 or 3
 */
function checkPythonVersion() {
  // Python 2.7 is EOL but still supported
  // Python 3.5+ are still supported (TODO: deprecate 3.5 on 2020-09-13)
  // https://devguide.python.org/#status-of-python-branches
  const recommendedVersion = '2.7 or 3.5+';
  const recommendedVersionRegex = /^2\.7|^3\.[5-9]/;

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
  // NPM is already used by default on Travis and Github Actions, so there is
  // nothing more to do.
  if (process.env.TRAVIS || process.env.GITHUB_ACTIONS) {
    return;
  }
  ensureNpm();
  await checkNodeVersion();
  runGulpChecks();
  checkPythonVersion();
  logNpmVersion();
  if (updatesNeeded.size) {
    console.log(
      yellow('\nWARNING: Detected problems with'),
      cyan(Array.from(updatesNeeded).join(', '))
    );
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
