/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
const colors = require('ansi-colors');
const fs = require('fs-extra');
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const path = require('path');
const tmp = require('tmp');
const {getStdout, execOrDie} = require('../exec');
const {gitCommitHash} = require('../git');

const runtimeFile = './dist/v0.js';
const maxSize = '82.6KB'; // Only use 0.1 KB of precision (no hundredths digit)

const buildArtifactsStorageRepo =
    'git@github.com:ampproject/amphtml-build-artifacts.git';
const bundleSizesJsonFile = 'bundle-sizes.json';

const {green, red, cyan, yellow} = colors;

/**
 * Clone the build artifacts storage repository to a temporary directory and
 * return the directory.
 *
 * This is a shallow clone, with only the head commit, to save time.
 */
function cloneBuildArtifactsStorageRepo() {
  const repoDir = tmp.dirSync().name;
  execOrDie(`git clone --depth 1 ${buildArtifactsStorageRepo} ${repoDir}`);
  return repoDir;
}

/**
 * Set the bundle size of a commit hash in the build artifacts storage
 * repository to the passed value.
 *
 * @param {string} repoDir full path to the cloned build artifacts storage
 *     repository.
 * @param {string} bundleSize the new bundle size in 99.99KB format.
 */
function setBundleSizeOfCommitInStorageRepo(repoDir, bundleSize) {
  const bundleSizesJsonFullFile = path.resolve(repoDir, bundleSizesJsonFile);
  const bundleSizes = fs.readJsonSync(bundleSizesJsonFullFile);
  const commitHash = gitCommitHash();
  bundleSizes[commitHash] = bundleSize;
  fs.writeJsonSync(bundleSizesJsonFullFile, bundleSizes);
  execOrDie(`git -C ${repoDir} commit --all ` +
      `--message "Set bundle-size value of ${commitHash} to ${bundleSize}"`);
  execOrDie(`git -C ${repoDir} push`);
}

/**
 * Checks gzipped size of existing v0.js (amp.js) against `maxSize`.
 * Does _not_ rebuild: run `gulp dist --fortesting --noextensions` first.
 */
function checkBundleSize() {
  let buildArtifactsStorageRepoDir;
  if (argv.store) {
    buildArtifactsStorageRepoDir = cloneBuildArtifactsStorageRepo();
  }

  if (!fs.existsSync(runtimeFile)) {
    log(yellow('Could not find'), cyan(runtimeFile) +
        yellow('. Skipping bundlesize check.'));
    log(yellow('To include this check, run'),
        cyan('gulp dist --fortesting [--noextensions]'),
        yellow('before'), cyan('gulp bundle-size') + yellow('.'));
    return;
  }

  const cmd = `npx bundlesize -f "${runtimeFile}" -s "${maxSize}"`;
  log('Running ' + cyan(cmd) + '...');
  const output = getStdout(cmd);
  const pass = output.match(/PASS .*/);
  const fail = output.match(/FAIL .*/);
  const error = output.match(/ERROR .*/);
  const bundleSizeMatches = output.match(/: (\d+.?\d*KB)/);
  if (error && error.length > 0) {
    log(yellow(error[0]));
    process.exitCode = 1;
    return;
  } else if (!bundleSizeMatches) {
    log(red('ERROR:'), 'could not infer bundle size from output.');
    log(yellow(output));
    process.exitCode = 1;
    return;
  } else if (fail && fail.length > 0) {
    log(red(fail[0]));
    log(red('ERROR:'), cyan('bundlesize'), red('found that'),
        cyan(runtimeFile), red('has exceeded its size cap of'),
        cyan(maxSize) + red('.'));
    log(red(
        'This is part of a new effort to reduce AMP\'s binary size (#14392).'));
    log(red('Please contact @choumx or @jridgewell for assistance.'));
    process.exitCode = 1;
  } else if (pass && pass.length > 0) {
    log(green(pass[0]));
  } else {
    log(yellow(output));
  }

  if (argv.store) {
    setBundleSizeOfCommitInStorageRepo(
        buildArtifactsStorageRepoDir, bundleSizeMatches[1]);
  }
}


gulp.task(
    'bundle-size',
    'Checks if the minified AMP binary has exceeded its size cap',
    checkBundleSize,
    {
      options: {
        'store': '  Set this to store the bundle size in the AMP build '
            + 'artifacts repository. Should only be executed for Travis push '
            + 'builds on the master branch.',
      },
    });
