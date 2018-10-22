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
const octokit = require('@octokit/rest')();
const path = require('path');
const {getStdout} = require('../exec');
const {gitCommitHash, gitOriginUrl} = require('../git');

const runtimeFile = './dist/v0.js';

const buildArtifactsRepoOptions = {
  owner: 'ampproject',
  repo: 'amphtml-build-artifacts',
};
const expectedGitHubProject = 'ampproject/amphtml';

const {green, red, cyan, yellow} = colors;

/**
 * Get the max bundle size from the build artifacts repository.
 *
 * @return {number} the max allowed bundle size.
 */
async function getMaxBundleSize() {
  if (process.env.GITHUB_ARTIFACTS_RO_TOKEN) {
    octokit.authenticate({
      type: 'token',
      token: process.env.GITHUB_ARTIFACTS_RO_TOKEN,
    });
  }

  return await octokit.repos.getContent(
      Object.assign(buildArtifactsRepoOptions, {
        path: path.join('bundle-size', '.max_size'),
      })
  ).then(result => {
    const maxSize =
        Buffer.from(result.data.content, 'base64').toString().trim();
    log('Max bundle size from GitHub is', cyan(maxSize));
    return maxSize;
  }).catch(error => {
    log(red('ERROR: Failed to retrieve the max allowed bundle size from' +
            ' GitHub.'));
    throw error;
  });
}

/**
 * Store the bundle size of a commit hash in the build artifacts storage
 * repository to the passed value.
 *
 * @param {string} bundleSize the new bundle size in 99.99KB format.
 * @return {!Promise}
 */
function storeBundleSize(bundleSize) {
  if (!process.env.TRAVIS || process.env.TRAVIS_EVENT_TYPE !== 'push') {
    log(yellow('Skipping'), cyan('--store') + ':',
        'this action can only be performed on `push` builds on Travis');
    return;
  }

  const gitOriginUrlValue = gitOriginUrl();
  if (!gitOriginUrlValue.includes(expectedGitHubProject)) {
    log('Git origin URL is', cyan(gitOriginUrlValue));
    log('Skipping storing the bundle size in the artifacts repository on',
        'GitHub...');
    return;
  }

  if (!process.env.GITHUB_ARTIFACTS_RW_TOKEN) {
    log(red('ERROR: Missing GITHUB_ARTIFACTS_RW_TOKEN, cannot store the ' +
        'bundle size in the artifacts repository on GitHub!'));
    process.exitCode = 1;
    return;
  }

  const commitHash = gitCommitHash();
  const githubApiCallOptions = Object.assign(buildArtifactsRepoOptions, {
    path: path.join('bundle-size', commitHash),
  });

  octokit.authenticate({
    type: 'token',
    token: process.env.GITHUB_ARTIFACTS_RW_TOKEN,
  });

  return octokit.repos.getContent(githubApiCallOptions).then(() => {
    log('The file', cyan(`bundle-size/${commitHash}`), 'already exists in the',
        'build artifacts repository on GitHub. Skipping...');
  }).catch(() => {
    return octokit.repos.createFile(Object.assign(githubApiCallOptions, {
      message: `bundle-size: ${commitHash} (${bundleSize})`,
      content: Buffer.from(bundleSize).toString('base64'),
    })).then(() => {
      log('Stored the new bundle size of', cyan(bundleSize), 'in the artifacts',
          'repository on GitHub');
    }).catch(error => {
      log(red(`ERROR: Failed to create the bundle-size/${commitHash} file in`),
          red('the build artifacts repository on GitHub!'));
      log(red('Error message was:'), error.message);
      process.exitCode = 1;
    });
  });
}

/**
 * Checks gzipped size of existing v0.js (amp.js) against `maxSize`.
 * Does _not_ rebuild: run `gulp dist --fortesting --noextensions` first.
 */
async function checkBundleSize() {
  if (!fs.existsSync(runtimeFile)) {
    log(yellow('Could not find'), cyan(runtimeFile) +
        yellow('. Skipping bundlesize check.'));
    log(yellow('To include this check, run'),
        cyan('gulp dist --fortesting [--noextensions]'),
        yellow('before'), cyan('gulp bundle-size') + yellow('.'));
    return;
  }

  const maxSize = await getMaxBundleSize();

  const cmd = `npx bundlesize -f "${runtimeFile}" -s "${maxSize}"`;
  log('Running ' + cyan(cmd) + '...');
  const output = getStdout(cmd);
  const pass = output.match(/PASS .*/);
  const fail = output.match(/FAIL .*/);
  const error = output.match(/ERROR .*/);
  const bundleSizeFormatMatches = output.match(/: (\d+.?\d*KB)/);
  if (error && error.length > 0) {
    log(yellow(error[0]));
    process.exitCode = 1;
    return;
  } else if (!bundleSizeFormatMatches) {
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
    return storeBundleSize(bundleSizeFormatMatches[1]);
  }
}


gulp.task(
    'bundle-size',
    'Checks if the minified AMP binary has exceeded its size cap',
    checkBundleSize,
    {
      options: {
        'store': '  Store bundle size in AMP build artifacts repo (used only '
            + 'for `master` builds)',
      },
    });
