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
const log = require('fancy-log');
const path = require('path');
const url = require('url');
const util = require('util');
const {
  gitCommitHash,
  gitTravisMasterBaseline,
  shortSha,
} = require('../../common/git');
const {
  isTravisPullRequestBuild,
  isTravisPushBuild,
  travisPushBranch,
  travisRepoSlug,
} = require('../../common/travis');
const {
  VERSION: internalRuntimeVersion,
} = require('../../compile/internal-version');
const {cyan, red, yellow} = require('ansi-colors');

const requestPost = util.promisify(require('request').post);

const fileGlobs = ['dist/*.js', 'dist/v0/*-?.?.js'];

const expectedGitHubRepoSlug = 'ampproject/amphtml';
const bundleSizeAppBaseUrl = 'https://amp-bundle-size-bot.appspot.com/v0/';

/**
 * Get the brotli bundle sizes of the current build.
 *
 * @return {Map<string, number>} the bundle size in KB rounded to 2 decimal
 *   points.
 */
function getBrotliBundleSizes() {
  return {
    'dist/alp.js': 5.91,
    'dist/amp-story-embed-v0.js': 0.7,
    'dist/amp4ads-host-v0.js': 7.09,
    'dist/amp4ads-v0.js': 54.58,
    'dist/examiner.js': 0.37,
    'dist/shadow-v0.js': 67.92,
    'dist/v0.js': 78.21,
    'dist/video-iframe-integration-v0.js': 2.09,
    'dist/ww.js': 13.5,
    'dist/v0/amp-3d-gltf-0.1.js': 6.17,
    'dist/v0/amp-3q-player-0.1.js': 8.37,
    'dist/v0/amp-access-0.1.js': 15.69,
    'dist/v0/amp-access-laterpay-0.1.js': 4.05,
    'dist/v0/amp-access-laterpay-0.2.js': 4.17,
    'dist/v0/amp-access-poool-0.1.js': 3.8,
    'dist/v0/amp-access-scroll-0.1.js': 5.39,
    'dist/v0/amp-accordion-0.1.js': 4.95,
    'dist/v0/amp-action-macro-0.1.js': 1.91,
    'dist/v0/amp-ad-0.1.js': 17.79,
    'dist/v0/amp-ad-custom-0.1.js': 57.14,
    'dist/v0/amp-ad-exit-0.1.js': 5.46,
    'dist/v0/amp-ad-network-adsense-impl-0.1.js': 71.55,
    'dist/v0/amp-ad-network-adzerk-impl-0.1.js': 65.92,
    'dist/v0/amp-ad-network-cloudflare-impl-0.1.js': 65.71,
    'dist/v0/amp-ad-network-doubleclick-impl-0.1.js': 80.34,
    'dist/v0/amp-ad-network-fake-impl-0.1.js': 67.04,
    'dist/v0/amp-ad-network-gmossp-impl-0.1.js': 65.39,
    'dist/v0/amp-ad-network-mytarget-impl-0.1.js': 65.46,
    'dist/v0/amp-ad-network-triplelift-impl-0.1.js': 65.37,
    'dist/v0/amp-addthis-0.1.js': 7.99,
    'dist/v0/amp-analytics-0.1.js': 40.87,
    'dist/v0/amp-anim-0.1.js': 1.28,
    'dist/v0/amp-animation-0.1.js': 28.37,
    'dist/v0/amp-apester-media-0.1.js': 9.44,
    'dist/v0/amp-app-banner-0.1.js': 3.98,
    'dist/v0/amp-audio-0.1.js': 4.14,
    'dist/v0/amp-auto-ads-0.1.js': 10.31,
    'dist/v0/amp-auto-lightbox-0.1.js': 2.34,
    'dist/v0/amp-autocomplete-0.1.js': 9.02,
    'dist/v0/amp-base-carousel-0.1.js': 8.74,
    'dist/v0/amp-beopinion-0.1.js': 5.46,
    'dist/v0/amp-bind-0.1.js': 15.75,
    'dist/v0/amp-bodymovin-animation-0.1.js': 6.18,
    'dist/v0/amp-brid-player-0.1.js': 9.24,
    'dist/v0/amp-brightcove-0.1.js': 9.1,
    'dist/v0/amp-byside-content-0.1.js': 5.37,
    'dist/v0/amp-call-tracking-0.1.js': 2.78,
    'dist/v0/amp-carousel-0.1.js': 8.32,
    'dist/v0/amp-carousel-0.2.js': 8.88,
    'dist/v0/amp-connatix-player-0.1.js': 1.25,
    'dist/v0/amp-consent-0.1.js': 11.23,
    'dist/v0/amp-crypto-polyfill-0.1.js': 3.63,
    'dist/v0/amp-dailymotion-0.1.js': 8.85,
    'dist/v0/amp-date-countdown-0.1.js': 3,
    'dist/v0/amp-date-display-0.1.js': 1.48,
    'dist/v0/amp-date-picker-0.1.js': 117.77,
    'dist/v0/amp-delight-player-0.1.js': 8.88,
    'dist/v0/amp-dynamic-css-classes-0.1.js': 1.64,
    'dist/v0/amp-embedly-card-0.1.js': 5.39,
    'dist/v0/amp-experiment-0.1.js': 2.17,
    'dist/v0/amp-experiment-1.0.js': 7.2,
    'dist/v0/amp-facebook-0.1.js': 6.1,
    'dist/v0/amp-facebook-comments-0.1.js': 6.08,
    'dist/v0/amp-facebook-like-0.1.js': 5.69,
    'dist/v0/amp-facebook-page-0.1.js': 6.09,
    'dist/v0/amp-fit-text-0.1.js': 1.36,
    'dist/v0/amp-font-0.1.js': 1.87,
    'dist/v0/amp-form-0.1.js': 14.62,
    'dist/v0/amp-fx-collection-0.1.js': 4.86,
    'dist/v0/amp-fx-flying-carpet-0.1.js': 1.87,
    'dist/v0/amp-geo-0.1.js': 3.16,
    'dist/v0/amp-gfycat-0.1.js': 8.34,
    'dist/v0/amp-gist-0.1.js': 5.26,
    'dist/v0/amp-google-document-embed-0.1.js': 1.19,
    'dist/v0/amp-google-vrview-image-0.1.js': 2.54,
    'dist/v0/amp-gwd-animation-0.1.js': 3.75,
    'dist/v0/amp-hulu-0.1.js': 0.99,
    'dist/v0/amp-iframe-0.1.js': 8.15,
    'dist/v0/amp-ima-video-0.1.js': 11.77,
    'dist/v0/amp-image-lightbox-0.1.js': 8.91,
    'dist/v0/amp-image-slider-0.1.js': 5.24,
    'dist/v0/amp-image-viewer-0.1.js': 7.87,
    'dist/v0/amp-imgur-0.1.js': 1.24,
    'dist/v0/amp-inline-gallery-0.1.js': 2.38,
    'dist/v0/amp-inputmask-0.1.js': 21.64,
    'dist/v0/amp-instagram-0.1.js': 1.95,
    'dist/v0/amp-install-serviceworker-0.1.js': 3.87,
    'dist/v0/amp-izlesene-0.1.js': 1.27,
    'dist/v0/amp-jwplayer-0.1.js': 1.51,
    'dist/v0/amp-kaltura-player-0.1.js': 1.53,
    'dist/v0/amp-lightbox-0.1.js': 6.94,
    'dist/v0/amp-lightbox-gallery-0.1.js': 17.53,
    'dist/v0/amp-link-rewriter-0.1.js': 2.96,
    'dist/v0/amp-list-0.1.js': 11.61,
    'dist/v0/amp-live-list-0.1.js': 7.39,
    'dist/v0/amp-loader-0.1.js': 2.91,
    'dist/v0/amp-login-done-0.1.js': 9.64,
    'dist/v0/amp-mathml-0.1.js': 5.41,
    'dist/v0/amp-mega-menu-0.1.js': 3.82,
    'dist/v0/amp-megaphone-0.1.js': 1.67,
    'dist/v0/amp-minute-media-player-0.1.js': 8.72,
    'dist/v0/amp-mowplayer-0.1.js': 8.62,
    'dist/v0/amp-mraid-0.1.js': 1.97,
    'dist/v0/amp-mustache-0.1.js': 13.93,
    'dist/v0/amp-mustache-0.2.js': 12.41,
    'dist/v0/amp-nested-menu-0.1.js': 2.99,
    'dist/v0/amp-next-page-0.1.js': 13.87,
    'dist/v0/amp-next-page-0.2.js': 11.02,
    'dist/v0/amp-nexxtv-player-0.1.js': 9.01,
    'dist/v0/amp-o2-player-0.1.js': 1.15,
    'dist/v0/amp-ooyala-player-0.1.js': 8.48,
    'dist/v0/amp-orientation-observer-0.1.js': 2.23,
    'dist/v0/amp-pan-zoom-0.1.js': 8.38,
    'dist/v0/amp-pinterest-0.1.js': 6.8,
    'dist/v0/amp-playbuzz-0.1.js': 6.13,
    'dist/v0/amp-position-observer-0.1.js': 3.66,
    'dist/v0/amp-powr-player-0.1.js': 8.94,
    'dist/v0/amp-reach-player-0.1.js': 0.91,
    'dist/v0/amp-recaptcha-input-0.1.js': 8.51,
    'dist/v0/amp-redbull-player-0.1.js': 8.36,
    'dist/v0/amp-reddit-0.1.js': 5.42,
    'dist/v0/amp-riddle-quiz-0.1.js': 1.19,
    'dist/v0/amp-script-0.1.js': 18.5,
    'dist/v0/amp-script-worker-0.1.js': 13.28,
    'dist/v0/amp-selector-0.1.js': 3.66,
    'dist/v0/amp-share-tracking-0.1.js': 2.05,
    'dist/v0/amp-sidebar-0.1.js': 7.65,
    'dist/v0/amp-sidebar-0.2.js': 7.7,
    'dist/v0/amp-skimlinks-0.1.js': 7.42,
    'dist/v0/amp-slides-0.1.js': 0.54,
    'dist/v0/amp-smartlinks-0.1.js': 5.26,
    'dist/v0/amp-social-share-0.1.js': 5.59,
    'dist/v0/amp-soundcloud-0.1.js': 1.09,
    'dist/v0/amp-springboard-player-0.1.js': 1.25,
    'dist/v0/amp-standalone-0.1.js': 1.58,
    'dist/v0/amp-sticky-ad-0.1.js': 2.53,
    'dist/v0/amp-sticky-ad-1.0.js': 2.53,
    'dist/v0/amp-story-0.1.js': 47.41,
    'dist/v0/amp-story-1.0.js': 71.35,
    'dist/v0/amp-story-auto-ads-0.1.js': 13.95,
    'dist/v0/amp-subscriptions-0.1.js': 19.19,
    'dist/v0/amp-subscriptions-google-0.1.js': 36.22,
    'dist/v0/amp-timeago-0.1.js': 6.49,
    'dist/v0/amp-truncate-text-0.1.js': 3.42,
    'dist/v0/amp-twitter-0.1.js': 6.08,
    'dist/v0/amp-user-notification-0.1.js': 4.61,
    'dist/v0/amp-video-0.1.js': 9.54,
    'dist/v0/amp-video-docking-0.1.js': 10.46,
    'dist/v0/amp-video-iframe-0.1.js': 9,
    'dist/v0/amp-viewer-assistance-0.1.js': 2.15,
    'dist/v0/amp-viewer-integration-0.1.js': 6.68,
    'dist/v0/amp-vimeo-0.1.js': 8.43,
    'dist/v0/amp-vine-0.1.js': 0.95,
    'dist/v0/amp-viqeo-player-0.1.js': 10.99,
    'dist/v0/amp-viz-vega-0.1.js': 139.72,
    'dist/v0/amp-vk-0.1.js': 1.91,
    'dist/v0/amp-web-push-0.1.js': 6.4,
    'dist/v0/amp-wistia-player-0.1.js': 8.49,
    'dist/v0/amp-yotpo-0.1.js': 5.4,
    'dist/v0/amp-youtube-0.1.js': 9.41,
  };
}

/**
 * Store the bundle size of a commit hash in the build artifacts storage
 * repository to the passed value.
 */
async function storeBundleSize() {
  if (!isTravisPushBuild() || travisPushBranch() !== 'master') {
    log(
      yellow('Skipping'),
      cyan('--on_push_build') + ':',
      'this action can only be performed on `master` push builds on Travis'
    );
    return;
  }

  if (travisRepoSlug() !== expectedGitHubRepoSlug) {
    log(
      yellow('Skipping'),
      cyan('--on_push_build') + ':',
      'this action can only be performed on Travis builds on the',
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
        bundleSizes: getBrotliBundleSizes(),
      },
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(
        `${response.statusCode} ${response.statusMessage}: ` + response.body
      );
    }
  } catch (error) {
    log(red('Could not store the bundle size'));
    log(red(error));
    process.exitCode = 1;
    return;
  }
}

/**
 * Mark a pull request on Travis as skipped, via the AMP bundle-size GitHub App.
 */
async function skipBundleSize() {
  if (isTravisPullRequestBuild()) {
    const commitHash = gitCommitHash();
    try {
      const response = await requestPost(
        url.resolve(
          bundleSizeAppBaseUrl,
          path.join('commit', commitHash, 'skip')
        )
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(
          `${response.statusCode} ${response.statusMessage}: ` + response.body
        );
      }
    } catch (error) {
      log(red('Could not report a skipped pull request'));
      log(red(error));
      process.exitCode = 1;
      return;
    }
  } else {
    log(
      yellow(
        'Not marking this pull request to skip because that can only be ' +
          'done on Travis'
      )
    );
  }
}

/**
 * Report the size to the bundle-size GitHub App, to determine size changes.
 */
async function reportBundleSize() {
  if (isTravisPullRequestBuild()) {
    const baseSha = gitTravisMasterBaseline();
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
          bundleSizes: getBrotliBundleSizes(),
        },
      });
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(
          `${response.statusCode} ${response.statusMessage}: ` + response.body
        );
      }
    } catch (error) {
      log(red('Could not report the bundle size of this pull request'));
      log(red(error));
      process.exitCode = 1;
      return;
    }
  } else {
    log(
      yellow(
        'Not reporting the bundle size of this pull request because ' +
          'that can only be done on Travis'
      )
    );
  }
}

function getLocalBundleSize() {
  if (globby.sync(fileGlobs).length === 0) {
    log('Could not find runtime files.');
    log('Run', cyan('gulp dist --noextensions'), 'and re-run this task.');
    process.exitCode = 1;
    return;
  } else {
    log(
      'Computing bundle size for version',
      cyan(internalRuntimeVersion),
      'at commit',
      cyan(shortSha(gitCommitHash())) + '.'
    );
  }
  getBrotliBundleSizes();
}

async function bundleSize() {
  if (argv.on_skipped_build) {
    return await skipBundleSize();
  } else if (argv.on_push_build) {
    return await storeBundleSize();
  } else if (argv.on_pr_build) {
    return await reportBundleSize();
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
    '  Store bundle size in AMP build artifacts repo ' +
    '(also implies --on_pr_build)',
  'on_pr_build': '  Report the bundle size of this pull request to GitHub',
  'on_skipped_build':
    "  Set the status of this pull request's bundle " +
    'size check in GitHub to `skipped`',
  'on_local_build': '  Compute the bundle size of the locally built runtime',
};
