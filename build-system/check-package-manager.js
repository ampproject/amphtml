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

const setupInstructionsUrl = 'https://github.com/ampproject/amphtml/blob/master/contributing/getting-started-quick.md#one-time-setup';

// Color formatting may not yet be available via gulp-util.
function red(text) {return '\x1b[31m' + text + '\x1b[0m';}
function cyan(text) {return '\x1b[36m' + text + '\x1b[0m';}
function green(text) {return '\x1b[32m' + text + '\x1b[0m';}
function yellow(text) {return '\x1b[33m' + text + '\x1b[0m';}

/**
 * @fileoverview Makes sure that packages are being installed via yarn
 */
function main() {
  // Yarn is already used by default on Travis, so there is nothing more to do.
  if (process.env.TRAVIS) {
    return 0;
  }

  // If npm is being run, print a message and cause 'npm install' to fail.
  if (process.env.npm_execpath.indexOf('yarn') === -1) {
    console/*OK*/.log(red(
        '*** The AMP project uses yarn for package management ***'), '\n');
    console/*OK*/.log(yellow('To install all packages:'));
    console/*OK*/.log(cyan('$'), 'yarn', '\n');
    console/*OK*/.log(yellow(
        'To install a new package (and update package.json and yarn.lock):'));
    console/*OK*/.log(cyan('$'),
        'yarn add --dev --exact [package_name@version]', '\n');
    console/*OK*/.log(yellow('To upgrade a package:'));
    console/*OK*/.log(cyan('$'),
        'yarn upgrade --exact [package_name@version]', '\n');
    console/*OK*/.log(yellow('To remove a package:'));
    console/*OK*/.log(cyan('$'), 'yarn remove [package_name]', '\n');
    console/*OK*/.log(yellow('For detailed instructions, see'),
        cyan(setupInstructionsUrl), '\n');
    return 1;
  }

  // If yarn is being run, proceed with the install.
  console/*OK*/.log(green('Detected yarn. Installing packages...'));
  return 0;
}

process.exit(main());
