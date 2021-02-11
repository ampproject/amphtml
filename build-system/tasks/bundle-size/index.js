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
const globby = require('globby');
const path = require('path');
const url = require('url');
const util = require('util');
const {
  gitCommitHash,
  gitCiMasterBaseline,
  shortSha,
} = require('../../common/git');
const {
  isPullRequestBuild,
  isPushBuild,
  ciPushBranch,
  ciRepoSlug,
} = require('../../common/ci');
const {
  VERSION: internalRuntimeVersion,
} = require('../../compile/internal-version');
const {cyan, red, yellow} = require('kleur/colors');
const {log} = require('../../common/logging');
const {report, NoTTYReport} = require('@ampproject/filesize');

const requestPost = util.promisify(require('request').post);

const filesizeConfigPath = require.resolve('./filesize.json');
const fileGlobs = require(filesizeConfigPath).filesize.track;
const normalizedRtvNumber = '1234567890123';

const expectedGitHubRepoSlug = 'ampproject/amphtml';
const bundleSizeAppBaseUrl = 'https://amp-bundle-size-bot.appspot.com/v0/';
const replacementExpression = new RegExp(internalRuntimeVersion, 'g');

/**
 * Get the brotli bundle sizes of the current build after normalizing the RTV number.
 *
 * @return {Map<string, number>} the bundle size in KB rounded to 2 decimal
 *   points.
 */
async function getBrotliBundleSizes() {
  const bundleSizes = {};
  const sizes = await report(
    filesizeConfigPath,
    (content) => content.replace(replacementExpression, normalizedRtvNumber),
    NoTTYReport,
    /* silent */ false
  );
  for (const size of sizes) {
    const [filePath, sizeMap] = size;
    const relativePath = path.relative('.', filePath);
    const reportedSize = parseFloat((sizeMap[0][0] / 1024).toFixed(2));
    bundleSizes[relativePath] = reportedSize;
  }
  return bundleSizes;
}

/**
 * Checks the response of an operation. Throws if there's an error, and prints
 * success messages if not.
 * @param {!Object} response
 * @param {...string} successMessages
 */
function checkResponse(response, ...successMessages) {
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `${response.statusCode} ${response.statusMessage}: ` + response.body
    );
  } else {
    log(...successMessages);
  }
}

/**
 * Store the bundle sizes for a commit hash in the build artifacts storage
 * repository to the passed value.
 */
async function storeBundleSize() {
  if (!isPushBuild() || ciPushBranch() !== 'master') {
    log(
      yellow('Skipping'),
      cyan('--on_push_build') + ':',
      'this action can only be performed on `master` push builds during CI'
    );
    return;
  }

  if (ciRepoSlug() !== expectedGitHubRepoSlug) {
    log(
      yellow('Skipping'),
      cyan('--on_push_build') + ':',
      'this action can only be performed during CI builds on the',
      cyan(expectedGitHubRepoSlug),
      'repository'
    );
    return;
  }

  const commitHash = gitCommitHash();
  try {
    const response = await requestPost({
      uri: url.resolve(
        bundleSizeAppBaseUrl,
        path.join('commit', commitHash, 'store')
      ),
      json: true,
      body: {
        token: process.env.BUNDLE_SIZE_TOKEN,
        bundleSizes: await getBrotliBundleSizes(),
      },
    });
    checkResponse(
      response,
      'Successfully stored bundle sizes for commit',
      cyan(shortSha(commitHash)) + '.'
    );
  } catch (error) {
    log(red('Could not store bundle sizes'));
    log(red(error));
    process.exitCode = 1;
    return;
  }
}

/**
 * Mark a pull request as skipped, via the AMP bundle-size GitHub App.
 */
async function skipBundleSize() {
  if (isPullRequestBuild()) {
    const commitHash = gitCommitHash();
    try {
      const response = await requestPost(
        url.resolve(
          bundleSizeAppBaseUrl,
          path.join('commit', commitHash, 'skip')
        )
      );
      checkResponse(
        response,
        'Skipped bundle size reporting for commit',
        cyan(shortSha(commitHash)) + '.'
      );
    } catch (error) {
      log(red('Could not report a skipped pull request'));
      log(red(error));
      process.exitCode = 1;
      return;
    }
  } else {
    log(yellow('Pull requests can be marked as skipped only during CI builds'));
  }
}

/**
 * Report the size to the bundle-size GitHub App, to determine size changes.
 */
async function reportBundleSize() {
  if (isPullRequestBuild()) {
    const baseSha = gitCiMasterBaseline();
    const commitHash = gitCommitHash();
    try {
      const response = await requestPost({
        uri: url.resolve(
          bundleSizeAppBaseUrl,
          path.join('commit', commitHash, 'report')
        ),
        json: true,
        body: {
          baseSha,
          bundleSizes: await getBrotliBundleSizes(),
        },
      });
      checkResponse(
        response,
        'Successfully reported bundle sizes for commit',
        cyan(shortSha(commitHash)),
        'using baseline commit',
        cyan(shortSha(baseSha)) + '.'
      );
    } catch (error) {
      log(red('Could not report the bundle sizes for this pull request'));
      log(red(error));
      process.exitCode = 1;
      return;
    }
  } else {
    log(
      yellow(
        'Bundle sizes from pull requests can be reported only during CI builds'
      )
    );
  }
}

async function getLocalBundleSize() {
  if (globby.sync(fileGlobs).length === 0) {
    log('Could not find runtime files.');
    log('Run', cyan('gulp dist --noextensions'), 'and re-run this task.');
    process.exitCode = 1;
    return;
  } else {
    log(
      'Computing bundle sizes for version',
      cyan(internalRuntimeVersion),
      'at commit',
      cyan(shortSha(gitCommitHash())) + '.'
    );
  }
  await getBrotliBundleSizes();
}

async function bundleSize() {
  if (argv.on_skipped_build) {
    return skipBundleSize();
  } else if (argv.on_push_build) {
    return storeBundleSize();
  } else if (argv.on_pr_build) {
    return reportBundleSize();
  } else if (argv.on_local_build) {
    return getLocalBundleSize();
  } else {
    log(red('Called'), cyan('gulp bundle-size'), red('with no task.'));
    process.exitCode = 1;
  }
}

module.exports = {
  bundleSize,
};

bundleSize.description =
  'Checks if the minified AMP binary has exceeded its size cap';
bundleSize.flags = {
  'on_push_build':
    '  Store bundle sizes in the AMP build artifacts repo ' +
    '(also implies --on_pr_build)',
  'on_pr_build': '  Report the bundle sizes for this pull request to GitHub',
  'on_skipped_build':
    "  Set the status of this pull request's bundle " +
    'size check in GitHub to `skipped`',
  'on_local_build': '  Compute bundle sizes for the locally built runtime',
};
