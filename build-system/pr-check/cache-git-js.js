/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview cache the results of all function calls in git.js.
 */

const fs = require('fs');
const gitModule = require('../common/git');
const {cyan} = require('../common/colors');
const {log} = require('../common/logging');
const {runCiJob} = require('./ci-job');
const {VERSION} = require('../compile/internal-version');

const jobName = 'cache-git-js.js';

const customOverrides = {
  'shortSha': '(sha) => sha.substr(0, 7)',
  'gitDiffFileMain': '() => { throw new Error("gitDiffFileMain"); }',
  'gitCommitFormattedTime':
    '() => { throw new Error("gitCommitFormattedTime"); }',
  'gitDiffPath': '() => { throw new Error("gitDiffPath"); }',
};

/**
 * @fileoverview Facilitates replacing the real git.js file with cached version.
 */

/**
 * Generates a new git.js and stores it to the temporary workspace.
 */
function generateGitCliCache() {
  let newGitModuleText = '';

  for (const [gitFunctionName, gitFunction] of Object.entries(gitModule)) {
    if (gitFunctionName in customOverrides) {
      newGitModuleText += `const ${gitFunctionName} = ${customOverrides[gitFunctionName]};\n`;
      continue;
    } else {
      // @ts-ignore
      const result = JSON.stringify(JSON.stringify(gitFunction()));
      newGitModuleText += `const ${gitFunctionName} = () => JSON.parse(${result});\n`;
    }
  }

  const allGitFunctionNames = Object.keys(gitModule).join(',');
  newGitModuleText += `module.exports = {${allGitFunctionNames}};\n`;

  log(
    'Generated the following cached',
    cyan('git.js'),
    'file:\n',
    newGitModuleText
  );
  fs.writeFileSync('/tmp/workspace/git.js', newGitModuleText);
}

/**
 * Generates a new interal-version.js and stores it to the temporary workspace.
 */
function generateInternalVersionCache() {
  const newInternalVersionText = `exports.VERSION = "${VERSION}";`;
  log(
    'Generated the following cached',
    cyan('internal-version.js'),
    'file:\n',
    newInternalVersionText
  );

  fs.writeFileSync(
    '/tmp/workspace/internal-version.js',
    newInternalVersionText
  );
}

/**
 * Generates all required cached version of files.
 */
function generateCachedFiles() {
  generateGitCliCache();
  generateInternalVersionCache();
}

runCiJob(jobName, generateCachedFiles, generateCachedFiles);
