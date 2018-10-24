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
const {gitBranchPoint, gitCommitHash, gitOriginUrl} = require('../git');

const runtimeFile = './dist/v0.js';

const buildArtifactsRepoOptions = {
  owner: 'ampproject',
  repo: 'amphtml-build-artifacts',
};
const expectedGitHubProject = 'ampproject/amphtml';

const {green, red, cyan, yellow} = colors;

// Status values returned from running `npx bundlesize`
const STATUS_PASS = 0;
const STATUS_FAIL = 1;
const STATUS_ERROR = 2;

/**
 * Get the max bundle size from the build artifacts repository.
 *
 * @return {string} the max allowed bundle size.
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
 * Get the bundle size of the ancenstor commit from when this branch was split
 * off from the `master` branch.
 *
 * @return {string} the `master` ancestor's bundle size.
 */
async function getAncestorBundleSize() {
  const fromMerge =
      process.env.TRAVIS && process.env.TRAVIS_EVENT_TYPE === 'pull_request';
  const gitBranchPointSha = gitBranchPoint(fromMerge);
  const gitBranchPointShortSha = gitBranchPointSha.substring(0, 7);
  log('Branch point from master is', cyan(gitBranchPointShortSha));
  return await octokit.repos.getContent(
      Object.assign(buildArtifactsRepoOptions, {
        path: path.join('bundle-size', gitBranchPointSha),
      })
  ).then(result => {
    const ancestorBundleSize =
        Buffer.from(result.data.content, 'base64').toString().trim();
    log('Bundle size of', cyan(gitBranchPointShortSha), 'is',
        cyan(ancestorBundleSize));
    return ancestorBundleSize;
  }).catch(() => {
    log(yellow('WARNING: Failed to retrieve bundle size of'),
        cyan(gitBranchPointShortSha));
    log(yellow('Falling back to comparing to the max bundle size only'));
    return null;
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

function compareBundleSize(maxBundleSize) {
  const cmd = `npx bundlesize -f "${runtimeFile}" -s "${maxBundleSize}"`;
  log('Running ' + cyan(cmd) + '...');
  const output = getStdout(cmd).trim();

  const error = output.match(/ERROR .*/);
  if (error || output.length == 0) {
    return {
      output: error || '[no output from npx command]',
      status: STATUS_ERROR,
      newBundleSize: '',
    };
  }

  const bundleSizeOutputMatches = output.match(/(PASS|FAIL) .*: (\d+.?\d*KB) .*/);
  if (bundleSizeOutputMatches) {
    return {
      output: bundleSizeOutputMatches[0],
      status: bundleSizeOutputMatches[1] == 'PASS' ? STATUS_PASS : STATUS_FAIL,
      newBundleSize: bundleSizeOutputMatches[2],
    };
  }
  log(red('ERROR:'), 'could not infer bundle size from output.');
  return {
    output,
    status: STATUS_ERROR,
    newBundleSize: '',
  };
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
  const ancestorBundleSize = await getAncestorBundleSize();

  let compareAgainstMaxSize = true;
  let output, status, newBundleSize;
  if (ancestorBundleSize) {
    ({output, status, newBundleSize} = compareBundleSize(ancestorBundleSize));
    switch (status) {
      case STATUS_ERROR:
        log(red(output));
        process.exitCode = 1;
        return;
      case STATUS_FAIL:
        const sizeDelta =
            (parseFloat(newBundleSize) - parseFloat(ancestorBundleSize))
                .toFixed(2);
        log(yellow('New bundle size of'), cyan(newBundleSize),
            yellow('is larger than the ancestor\'s bundle size of'),
            cyan(ancestorBundleSize),
            yellow('(Δ +') + cyan(sizeDelta) + yellow('KB)'));
        log('Continuing to compare to max bundle size...');
        compareAgainstMaxSize = true;
        break;
      case STATUS_PASS:
        log(green(output));
        compareAgainstMaxSize = false;
        break;
    }
  }

  if (compareAgainstMaxSize) {
    ({output, status, newBundleSize} = compareBundleSize(maxSize));
    switch (status) {
      case STATUS_ERROR:
        log(red(output));
        process.exitCode = 1;
        return;
      case STATUS_FAIL:
        const sizeDelta =
            (parseFloat(newBundleSize) - parseFloat(maxSize))
                .toFixed(2);
        log(red(output));
        log(red('ERROR:'), cyan('bundlesize'), red('found that'),
            cyan(runtimeFile), red('has exceeded its size cap of'),
            cyan(maxSize), red('(Δ +') + cyan(sizeDelta) + red('KB)'));
        log(red('This is part of a new effort to reduce AMP\'s binary size ' +
                '(#14392).'));
        log(red('Please contact @choumx or @jridgewell for assistance.'));
        process.exitCode = 1;
        return;
      case STATUS_PASS:
        log(green(output));
        break;
    }
  }

  if (argv.store) {
    return storeBundleSize(newBundleSize);
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
