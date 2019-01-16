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
const BBPromise = require('bluebird');
const colors = require('ansi-colors');
const fs = require('fs-extra');
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const octokit = require('@octokit/rest')();
const path = require('path');
const requestPost = BBPromise.promisify(require('request').post);
const url = require('url');
const {getStdout} = require('../exec');
const {gitCommitHash, gitTravisMasterBaseline, shortSha} = require('../git');

const runtimeFile = './dist/v0.js';

const buildArtifactsRepoOptions = {
  owner: 'ampproject',
  repo: 'amphtml-build-artifacts',
};
const expectedGitHubRepoSlug = 'ampproject/amphtml';
const bundleSizeAppBaseUrl = 'https://amp-bundle-size-bot.appspot.com/v0/';

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

  return await octokit.repos.getContents(
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
 * Get the gzipped bundle size of the current build.
 *
 * @return {string} the bundle size in KB rounded to 2 decimal points.
 */
function getGzippedBundleSize() {
  const cmd = `npx bundlesize -f "${runtimeFile}"`;
  log('Running', cyan(cmd) + '...');
  const output = getStdout(cmd).trim();

  const bundleSizeOutputMatches = output.match(/PASS .*: (\d+.?\d*KB) .*/);
  if (bundleSizeOutputMatches) {
    const bundleSize = parseFloat(bundleSizeOutputMatches[1]);
    log('Bundle size is', cyan(`${bundleSize}KB`));
    return bundleSize;
  }
  throw Error('could not infer bundle size from output.');
}

/**
 * Return true if this task is running on Travis as part of a pull request.
 *
 * @return {boolean} true if running on Travis as part of a pull request.
 */
function isPullRequest() {
  return process.env.TRAVIS && process.env.TRAVIS_EVENT_TYPE === 'pull_request';
}

/**
 * Get the bundle size of the ancenstor commit from when this branch was split
 * off from the `master` branch.
 *
 * @return {string} the `master` ancestor's bundle size.
 */
async function getAncestorBundleSize() {
  const gitBranchPoint = gitTravisMasterBaseline();
  log('Branch point from master is', cyan(shortSha(gitBranchPoint)));
  return await octokit.repos.getContents(
      Object.assign(buildArtifactsRepoOptions, {
        path: path.join('bundle-size', gitBranchPoint),
      })
  ).then(result => {
    const ancestorBundleSize =
        Buffer.from(result.data.content, 'base64').toString().trim();
    log('Bundle size of', cyan(shortSha(gitBranchPoint)), 'is',
        cyan(ancestorBundleSize));
    return ancestorBundleSize;
  }).catch(() => {
    log(yellow('WARNING: Failed to retrieve bundle size of baseline commit'),
        cyan(shortSha(gitBranchPoint)));
    log(yellow('Falling back to comparing to the max bundle size only'));
    return null;
  });
}

/**
 * Store the bundle size of a commit hash in the build artifacts storage
 * repository to the passed value.
 *
 * @return {!Promise}
 */
function storeBundleSize() {
  if (!process.env.TRAVIS || process.env.TRAVIS_EVENT_TYPE !== 'push') {
    log(yellow('Skipping'), cyan('--on_push_build') + ':',
        'this action can only be performed on `push` builds on Travis');
    return;
  }

  if (process.env.TRAVIS_REPO_SLUG !== expectedGitHubRepoSlug) {
    log(yellow('Skipping'), cyan('--on_push_build') + ':',
        'this action can only be performed on Travis builds on the',
        cyan(expectedGitHubRepoSlug), 'repository');
    return;
  }

  if (!process.env.GITHUB_ARTIFACTS_RW_TOKEN) {
    log(red('ERROR: Missing GITHUB_ARTIFACTS_RW_TOKEN, cannot store the ' +
        'bundle size in the artifacts repository on GitHub!'));
    process.exitCode = 1;
    return;
  }

  const bundleSize = `${getGzippedBundleSize()}KB`;
  const commitHash = gitCommitHash();
  const githubApiCallOptions = Object.assign(buildArtifactsRepoOptions, {
    path: path.join('bundle-size', commitHash),
  });

  octokit.authenticate({
    type: 'token',
    token: process.env.GITHUB_ARTIFACTS_RW_TOKEN,
  });

  return octokit.repos.getContents(githubApiCallOptions).then(() => {
    log('The file', cyan(`bundle-size/${commitHash}`), 'already exists in the',
        'build artifacts repository on GitHub. Skipping...');
  }).catch(() => {
    return octokit.repos.createFile(Object.assign(githubApiCallOptions, {
      message: `bundle-size: ${commitHash} (${bundleSize})`,
      content: Buffer.from(bundleSize).toString('base64'),
    })).then(() => {
      log('Stored the new bundle size of', cyan(bundleSize), 'in the ',
          'artifacts repository on GitHub');
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
async function legacyBundleSizeCheck() {
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
        log(green('How to proceed from here:'), 'send a pull request to edit',
            'the', cyan('bundle-size/.max_size'), 'file in the',
            cyan('ampproject/amphtml-build-artifacts'), 'repository.');
        log('Increases to the max size should be in', cyan('0.1KB'),
            'intervals');
        log('Direct link to edit this file and create a pull request:',
            cyan('https://github.com/ampproject/amphtml-build-artifacts/edit/' +
                 'master/bundle-size/.max_size'));
        log('Tag @choumx and @jridgewell in the PR description for approval.');
        log(yellow('Note: this process is being replaced by a GitHub' +
                   'Application check, instead of running on Travis.'));
        process.exitCode = 1;
        return;
      case STATUS_PASS:
        log(green(output));
        break;
    }
  }
}

/**
 * Mark a pull request on Travis as skipped, via the AMP bundle-size GitHub App.
 */
async function skipBundleSize() {
  if (isPullRequest()) {
    const commitHash = gitCommitHash();
    try {
      const response = await requestPost(url.resolve(bundleSizeAppBaseUrl,
          path.join('commit', commitHash, 'skip')));
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(
            `${response.statusCode} ${response.statusMessage}: ` +
            response.body);
      }
    } catch (error) {
      log(red('Could not report a skipped pull request'));
      log(red(error));
      process.exitCode = 1;
      return;
    }
  } else {
    log(yellow('Not marking this pull request to skip because that can only be '
               + 'done on Travis'));
  }
}

/**
 * Report the size to the bundle-size GitHub App, to determine size changes.
 */
async function reportBundleSize() {
  if (isPullRequest()) {
    const baseSha = gitTravisMasterBaseline();
    const bundleSize = parseFloat(getGzippedBundleSize());
    const commitHash = gitCommitHash();
    try {
      const response = await requestPost({
        uri: url.resolve(bundleSizeAppBaseUrl,
            path.join('commit', commitHash, 'report')),
        json: true,
        body: {
          baseSha,
          bundleSize,
        },
      });
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(
            `${response.statusCode} ${response.statusMessage}: ` +
            response.body);
      }
    } catch (error) {
      log(red('Could not report the bundle size of this pull request'));
      log(red(error));
      process.exitCode = 1;
      return;
    }
  } else {
    log(yellow('Not reporting the bundle size of this pull request because '
               + 'that can only be done on Travis'));
  }
}

async function performBundleSizeCheck() {
  if (argv.on_skipped_build) {
    return await skipBundleSize();
  } else {
    if (argv.on_push_build) {
      await storeBundleSize();
    } else if (argv.on_pr_build) {
      await reportBundleSize();
    }
    // TODO(danielrozenberg): remove the legacy check once the app has been
    // activated and tested on the repository.
    return await legacyBundleSizeCheck();
  }
}


gulp.task(
    'bundle-size',
    'Checks if the minified AMP binary has exceeded its size cap',
    performBundleSizeCheck,
    {
      options: {
        'on_push_build': '  Store bundle size in AMP build artifacts repo '
            + '(also implies --on_pr_build)',
        'on_pr_build': '  Report the bundle size of this pull request to '
            + 'GitHub',
        'on_skipped_build': '  Set the status of this pull request\'s bundle '
            + 'size check in GitHub to `skipped`',
      },
    });
