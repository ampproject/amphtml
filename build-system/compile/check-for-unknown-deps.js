/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
const fs = require('fs-extra');
const {log} = require('../common/logging');
const {red, cyan, yellow} = require('kleur/colors');

/**
 * Searches for the identifier "module$", which Closure uses to uniquely
 * reference module imports. If any are found, that means Closure couldn't
 * import the module correctly.
 * @param {string} file
 * @return {Promise<void>}
 */
async function checkForUnknownDeps(file) {
  const regex = /[\w$]*module\$[\w$]+/;
  const contents = await fs.readFile(file, 'utf-8');
  if (!contents.includes('module$')) {
    // Fast check, since regexes can backtrack like crazy.
    return;
  }
  const match = regex.exec(contents) || [
    `couldn't parse the dep. Look for "module$" in the file`,
  ];
  log(
    red('Error:'),
    `Unknown dependency ${cyan(match[0])} found in ${cyan(file)}`
  );
  if (argv.debug) {
    log(red('Output file contents:'));
    log(yellow(contents));
  }
  throw new Error('Compilation failed due to unknown dependency');
}

module.exports = {
  checkForUnknownDeps,
};
