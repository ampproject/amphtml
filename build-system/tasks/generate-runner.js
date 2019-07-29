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

const fs = require('fs-extra');
const log = require('fancy-log');
const {cyan, red} = require('ansi-colors');
const {getOutput} = require('../exec');
const {gitCommitHash, gitDiffPath} = require('../git');
const {isTravisBuild} = require('../travis');

const antExecutable = 'third_party/ant/bin/ant';
const runnerDir = 'build-system/runner';
const buildFile = `${runnerDir}/build.xml`;
const runnerDistDir = `${runnerDir}/dist`;
const generatedAtCommitFile = 'GENERATED_AT_COMMIT';

/**
 * Determines if runner.jar needs to be regenerated
 * @param {string} subDir
 * @return {boolean}
 */
function shouldGenerateRunner(subDir) {
  const runnerJarDir = `${runnerDistDir}/${subDir}`;
  const runnerJar = `${runnerJarDir}/runner.jar`;
  const generatedAtCommitPath = `${runnerJarDir}/${generatedAtCommitFile}`;

  // Always generate on Travis
  if (isTravisBuild()) {
    return true;
  }

  // The binary hasn't been generated
  if (!fs.existsSync(runnerJar)) {
    return true;
  }

  // We don't know when the binary was last generated
  if (!fs.existsSync(generatedAtCommitPath)) {
    return true;
  }

  // The binary was generated at a different commit
  const currentCommit = gitCommitHash();
  const generatedAtCommit = fs
    .readFileSync(generatedAtCommitPath, 'utf8')
    .toString();
  if (currentCommit != generatedAtCommit) {
    return true;
  }

  // There are local changes in the build-system/runner directory
  const localRunnerChanges = gitDiffPath(runnerDir, gitCommitHash());
  if (localRunnerChanges) {
    return true;
  }

  return false;
}

/**
 * Generates runner.jar if required
 * @param {string} subDir
 */
async function maybeGenerateRunner(subDir) {
  if (shouldGenerateRunner(subDir)) {
    await generateRunner(subDir);
  }
}

/**
 * Writes a file to the runner dir to indicate when it was last generated
 * @param {string} runnerJarDir
 */
function writeGeneratedAtCommitFile(runnerJarDir) {
  let generatedAtCommit = gitCommitHash();
  const localRunnerChanges = gitDiffPath(runnerDir, gitCommitHash());
  if (localRunnerChanges) {
    generatedAtCommit += '+local';
  }
  fs.ensureDirSync(runnerJarDir);
  fs.writeFileSync(
    `${runnerJarDir}/${generatedAtCommitFile}`,
    generatedAtCommit
  );
}

/**
 * Generates the custom closure compiler binary (runner.jar) and drops it in the
 * given subdirectory of build-system/runner/dist/ (to enable concurrent usage)
 * @param {string} subDir
 *
 * @return {*} TODO(#23582): Specify return type
 */
async function generateRunner(subDir) {
  const generateCmd = `${antExecutable} -buildfile ${buildFile} -Ddist.dir dist/${subDir} jar`;
  const runnerJarDir = `${runnerDistDir}/${subDir}`;
  writeGeneratedAtCommitFile(runnerJarDir);
  const result = getOutput(generateCmd);
  if (result.stderr) {
    log(
      red('ERROR:'),
      'Could not generate custom closure compiler',
      cyan(`${runnerJarDir}/runner.jar`)
    );
    console.error(red(result.stdout), red(result.stderr));
    const reason = new Error('Compiler generation failed');
    reason.showStack = false;
    return Promise.reject(reason);
  } else {
    if (!isTravisBuild()) {
      log(
        'Generated custom closure compiler',
        cyan(`${runnerJarDir}/runner.jar`)
      );
    }
  }
}

module.exports = {
  maybeGenerateRunner,
};
