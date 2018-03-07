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

const getStdout = require('./exec').getStdout;

const setupInstructionsUrl = 'https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-quick.md#one-time-setup';
const nodeScheduleUrl = 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json';

// Color formatting libraries may not be available when this script is run.
function red(text) {return '\x1b[31m' + text + '\x1b[0m';}
function cyan(text) {return '\x1b[36m' + text + '\x1b[0m';}
function green(text) {return '\x1b[32m' + text + '\x1b[0m';}
function yellow(text) {return '\x1b[33m' + text + '\x1b[0m';}

/**
 * @fileoverview Makes sure that packages are being installed via yarn
 */

function getNodeLatestLtsMajorVersion() {
  const schedule = getStdout('curl -L ' + nodeScheduleUrl).trim();
  const scheduleJson = JSON.parse(schedule);
  const versions = Object.keys(scheduleJson);
  let latestLtsMajorVersion = '';
  versions.forEach(version => {
    const lts = scheduleJson[version]['lts'];
    const maintenance = scheduleJson[version]['maintenance'];
    if (lts && maintenance) {
      const ltsDate = Date.parse(lts);
      const maintenanceDate = Date.parse(maintenance);
      const today = new Date();
      if (today >= ltsDate && today < maintenanceDate) {
        latestLtsMajorVersion = version;
      }
    }
  });
  return latestLtsMajorVersion;
}

function main() {
  // Yarn is already used by default on Travis, so there is nothing more to do.
  if (process.env.TRAVIS) {
    return 0;
  }

  // If npm is being run, print a message and cause 'npm install' to fail.
  if (process.env.npm_execpath.indexOf('yarn') === -1) {
    console.log(red(
        '*** The AMP project uses yarn for package management ***'), '\n');
    console.log(yellow('To install all packages:'));
    console.log(cyan('$'), 'yarn', '\n');
    console.log(
        yellow('To install a new (runtime) package to "dependencies":'));
    console.log(cyan('$'), 'yarn add --exact [package_name@version]', '\n');
    console.log(
        yellow('To install a new (toolset) package to "devDependencies":'));
    console.log(cyan('$'),
        'yarn add --dev --exact [package_name@version]', '\n');
    console.log(yellow('To upgrade a package:'));
    console.log(cyan('$'), 'yarn upgrade --exact [package_name@version]', '\n');
    console.log(yellow('To remove a package:'));
    console.log(cyan('$'), 'yarn remove [package_name]', '\n');
    console.log(yellow('For detailed instructions, see'),
        cyan(setupInstructionsUrl), '\n');
    return 1;
  }

  // Check the node version and print a warning if it is not the latest LTS.
  const latestLtsMajorVersion = getNodeLatestLtsMajorVersion();
  const nodeVersion = getStdout('node --version').trim();
  const nodeMajorVersion = nodeVersion.split('.')[0];
  if (latestLtsMajorVersion === '') {
    console.log(yellow('WARNING: Something went wrong. ' +
        'Could not determine latest LTS node version.'));
  }
  if (latestLtsMajorVersion !== '' &&
      nodeMajorVersion !== latestLtsMajorVersion) {
    console.log(yellow('WARNING: Detected node version'),
        cyan(nodeMajorVersion) +
        yellow('. Recommended (latest LTS) version is'),
        cyan(latestLtsMajorVersion) + yellow('.'));
    console.log(yellow('To fix this, run'),
        cyan('"nvm install --lts"'), yellow('or see'),
        cyan('https://nodejs.org/en/download/package-manager'),
        yellow('for instructions.'));
  } else {
    console.log(green('Detected node version'), cyan(nodeVersion) +
        green('.'));
  }

  // If yarn is being run, perform a version check and proceed with the install.
  const yarnVersion = getStdout('yarn --version').trim();
  const major = parseInt(yarnVersion.split('.')[0], 10);
  const minor = parseInt(yarnVersion.split('.')[1], 10);
  if ((major < 1) || (minor < 2)) {
    console.log(yellow('WARNING: Detected yarn version'),
        cyan(yarnVersion) + yellow('. Minimum recommended version is'),
        cyan('1.2.0') + yellow('.'));
    console.log(yellow('To upgrade, run'),
        cyan('"curl -o- -L https://yarnpkg.com/install.sh | bash"'),
        yellow('or see'), cyan('https://yarnpkg.com/docs/install'),
        yellow('for instructions.'));
    console.log(yellow('Attempting to install packages...'));
  } else {
    console.log(green('Detected yarn version'), cyan(yarnVersion) +
        green('. Installing packages...'));
  }
  return 0;
}

process.exit(main());
