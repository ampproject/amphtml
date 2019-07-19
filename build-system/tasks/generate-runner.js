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

const log = require('fancy-log');
const {cyan, red} = require('ansi-colors');
const {getOutput} = require('../exec');
const {isTravisBuild} = require('../travis');

const antExecutable = 'third_party/ant/bin/ant';
const buildFile = 'build-system/runner/build.xml';

/**
 * Generates the custom closure compiler binary (runner.jar) and drops it in the
 * given subdirectory of build-system/runner/dist/ (to enable concurrent usage)
 * @param {string} subDir
 *
 */
async function generateRunner(subDir) {
  const generateCmd = `${antExecutable} -buildfile ${buildFile} -Ddist.dir dist/${subDir} jar`;
  const runnerDir = `build-system/runner/dist/${subDir}`;
  const result = getOutput(generateCmd);
  if (result.stderr) {
    log(
      red('ERROR:'),
      'Could not generate custom closure compiler',
      cyan(`${runnerDir}/runner.jar`)
    );
    console.error(red(result.stdout), red(result.stderr));
    const reason = new Error('Compiler generation failed');
    reason.showStack = false;
    return Promise.reject(reason);
  } else {
    if (!isTravisBuild()) {
      log('Generated custom closure compiler', cyan(`${runnerDir}/runner.jar`));
    }
  }
  return Promise.resolve();
}

module.exports = {
  generateRunner,
};
