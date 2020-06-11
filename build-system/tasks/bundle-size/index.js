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

const filesizeConfigPath = require.resolve('./filesize.json');
const fileGlobs = require(filesizeConfigPath).filesize.track;

const expectedGitHubRepoSlug = 'ampproject/amphtml';
const bundleSizeAppBaseUrl = 'https://amp-bundle-size-bot.appspot.com/v0/';

/**
 * Get the brotli bundle sizes of the current build after normalizing the RTV number.
 *
 * @return {Map<string, number>} the bundle size in KB rounded to 2 decimal
 *   points.
 */
async function getBrotliBundleSizes() {
  return {
    'dist/examiner.js': 0.36,
    'dist/video-iframe-integration-v0.js': 2.32,
    'dist/alp.js': 6.06,
    'dist/amp4ads-host-v0.js': 7.26,
    'dist/amp-story-player-v0.js': 10.49,
    'dist/v0/amp-3d-gltf-0.1.js': 6.43,
    'dist/ww.js': 13.7,
    'dist/v0/amp-3q-player-0.1.js': 8.69,
    'dist/v0/amp-access-0.1.js': 16.32,
    'dist/v0/amp-access-laterpay-0.1.js': 4.18,
    'dist/v0/amp-access-laterpay-0.2.js': 4.29,
    'dist/v0/amp-access-poool-0.1.js': 4.05,
    'dist/v0/amp-action-macro-0.1.js': 2.46,
    'dist/v0/amp-access-scroll-0.1.js': 5.97,
    'dist/v0/amp-accordion-0.1.js': 5.81,
    'dist/amp4ads-v0.js': 56.27,
    'dist/v0/amp-ad-exit-0.1.js': 5.88,
    'dist/v0/amp-ad-0.1.js': 18.09,
    'dist/shadow-v0.js': 70.72,
    'dist/v0.js': 73.01,
    'dist/v0/amp-addthis-0.1.js': 8.21,
    'dist/v0/amp-ad-custom-0.1.js': 58.72,
    'dist/v0/amp-anim-0.1.js': 1.6,
    'dist/v0/amp-ad-network-adzerk-impl-0.1.js': 63.11,
    'dist/v0/amp-ad-network-adsense-impl-0.1.js': 73.56,
    'dist/v0/amp-analytics-0.1.js': 29.59,
    'dist/v0/amp-app-banner-0.1.js': 4.56,
    'dist/v0/amp-audio-0.1.js': 4.42,
    'dist/v0/amp-apester-media-0.1.js': 10.07,
    'dist/v0/amp-auto-lightbox-0.1.js': 2.99,
    'dist/v0/amp-auto-ads-0.1.js': 5.8,
    'dist/v0/amp-autocomplete-0.1.js': 9.31,
    'dist/v0/amp-ad-network-doubleclick-impl-0.1.js': 82.84,
    'dist/v0/amp-base-carousel-0.1.js': 9.33,
    'dist/v0/amp-beopinion-0.1.js': 5.68,
    'dist/v0/amp-bodymovin-animation-0.1.js': 6.39,
    'dist/v0/amp-animation-0.1.js': 30.61,
    'dist/v0/amp-bind-0.1.js': 16.43,
    'dist/v0/amp-call-tracking-0.1.js': 3.05,
    'dist/v0/amp-brid-player-0.1.js': 9.63,
    'dist/v0/amp-brightcove-0.1.js': 9.42,
    'dist/v0/amp-byside-content-0.1.js': 5.65,
    'dist/v0/amp-connatix-player-0.1.js': 2.01,
    'dist/v0/amp-carousel-0.1.js': 9.04,
    'dist/v0/amp-crypto-polyfill-0.1.js': 4.26,
    'dist/v0/amp-carousel-0.2.js': 9.51,
    'dist/v0/amp-ad-network-fake-impl-0.1.js': 64.07,
    'dist/v0/amp-date-display-0.1.js': 2.23,
    'dist/v0/amp-date-countdown-0.1.js': 3.54,
    'dist/v0/amp-dailymotion-0.1.js': 9.21,
    'dist/v0/amp-consent-0.1.js': 12.35,
    'dist/v0/amp-date-display-1.0.js': 7.74,
    'dist/v0/amp-dynamic-css-classes-0.1.js': 2.1,
    'dist/v0/amp-experiment-0.1.js': 2.89,
    'dist/v0/amp-delight-player-0.1.js': 9.34,
    'dist/v0/amp-embedly-card-0.1.js': 5.62,
    'dist/v0/amp-experiment-1.0.js': 7.43,
    'dist/v0/amp-facebook-0.1.js': 6.36,
    'dist/v0/amp-facebook-like-0.1.js': 5.92,
    'dist/v0/amp-facebook-comments-0.1.js': 6.34,
    'dist/v0/amp-fit-text-0.1.js': 1.74,
    'dist/v0/amp-facebook-page-0.1.js': 6.33,
    'dist/v0/amp-font-0.1.js': 2.63,
    'dist/v0/amp-fit-text-1.0.js': 7.52,
    'dist/v0/amp-fx-flying-carpet-0.1.js': 2.67,
    'dist/v0/amp-fx-collection-0.1.js': 5.44,
    'dist/v0/amp-geo-0.1.js': 4.17,
    'dist/v0/amp-gist-0.1.js': 5.47,
    'dist/v0/amp-google-document-embed-0.1.js': 1.94,
    'dist/v0/amp-google-vrview-image-0.1.js': 2.81,
    'dist/v0/amp-gfycat-0.1.js': 8.7,
    'dist/v0/amp-gwd-animation-0.1.js': 4.25,
    'dist/v0/amp-hulu-0.1.js': 1.78,
    'dist/v0/amp-form-0.1.js': 14.97,
    'dist/v0/amp-image-slider-0.1.js': 6,
    'dist/v0/amp-iframe-0.1.js': 8.67,
    'dist/v0/amp-ima-video-0.1.js': 12.07,
    'dist/v0/amp-imgur-0.1.js': 1.52,
    'dist/v0/amp-image-lightbox-0.1.js': 10.33,
    'dist/v0/amp-image-viewer-0.1.js': 8.66,
    'dist/v0/amp-instagram-0.1.js': 2.68,
    'dist/v0/amp-inline-gallery-0.1.js': 4.01,
    'dist/v0/amp-install-serviceworker-0.1.js': 4.07,
    'dist/v0/amp-izlesene-0.1.js': 2.04,
    'dist/v0/amp-intersection-observer-polyfill-0.1.js': 3.97,
    'dist/v0/amp-kaltura-player-0.1.js': 2.28,
    'dist/v0/amp-jwplayer-0.1.js': 9.69,
    'dist/v0/amp-link-rewriter-0.1.js': 3.44,
    'dist/v0/amp-lightbox-0.1.js': 7.37,
    'dist/v0/amp-inputmask-0.1.js': 22.24,
    'dist/v0/amp-live-list-0.1.js': 7.62,
    'dist/v0/amp-list-0.1.js': 12.61,
    'dist/v0/amp-loader-0.1.js': 4.09,
    'dist/v0/amp-lightbox-gallery-0.1.js': 17.74,
    'dist/v0/amp-login-done-0.1.js': 10.34,
    'dist/v0/amp-mathml-0.1.js': 5.62,
    'dist/v0/amp-megaphone-0.1.js': 2.39,
    'dist/v0/amp-mega-menu-0.1.js': 4.38,
    'dist/v0/amp-mraid-0.1.js': 2.15,
    'dist/v0/amp-minute-media-player-0.1.js': 9.05,
    'dist/v0/amp-mowplayer-0.1.js': 8.94,
    'dist/v0/amp-nested-menu-0.1.js': 3.59,
    'dist/v0/amp-mustache-0.1.js': 14.16,
    'dist/v0/amp-mustache-0.2.js': 12.74,
    'dist/v0/amp-nexxtv-player-0.1.js': 9.35,
    'dist/v0/amp-next-page-0.1.js': 14.34,
    'dist/v0/amp-o2-player-0.1.js': 1.92,
    'dist/v0/amp-orientation-observer-0.1.js': 2.77,
    'dist/v0/amp-ooyala-player-0.1.js': 8.81,
    'dist/v0/amp-next-page-1.0.js': 14.67,
    'dist/v0/amp-pan-zoom-0.1.js': 8.99,
    'dist/v0/amp-position-observer-0.1.js': 4.18,
    'dist/v0/amp-playbuzz-0.1.js': 6.39,
    'dist/v0/amp-pinterest-0.1.js': 7.15,
    'dist/v0/amp-reach-player-0.1.js': 1.73,
    'dist/v0/amp-recaptcha-input-0.1.js': 8.78,
    'dist/v0/amp-powr-player-0.1.js': 9.24,
    'dist/v0/amp-redbull-player-0.1.js': 8.71,
    'dist/v0/amp-riddle-quiz-0.1.js': 1.48,
    'dist/v0/amp-reddit-0.1.js': 5.66,
    'dist/v0/amp-selector-0.1.js': 4.21,
    'dist/v0/amp-selector-1.0.js': 8.26,
    'dist/v0/amp-share-tracking-0.1.js': 2.63,
    'dist/v0/amp-sidebar-0.1.js': 8.28,
    'dist/v0/amp-script-0.1.js': 19.5,
    'dist/v0/amp-script-worker-0.1.js': 13.43,
    'dist/v0/amp-skimlinks-0.1.js': 7.75,
    'dist/v0/amp-sidebar-0.2.js': 8.34,
    'dist/v0/amp-slides-0.1.js': 0.86,
    'dist/v0/amp-soundcloud-0.1.js': 1.88,
    'dist/v0/amp-smartlinks-0.1.js': 6.01,
    'dist/v0/amp-social-share-0.1.js': 6.09,
    'dist/v0/amp-springboard-player-0.1.js': 2.04,
    'dist/v0/amp-standalone-0.1.js': 1.79,
    'dist/v0/amp-sticky-ad-0.1.js': 3.28,
    'dist/v0/amp-sticky-ad-1.0.js': 3.28,
    'dist/v0/amp-social-share-1.0.js': 11.32,
    'dist/v0/amp-story-education-0.1.js': 6.63,
    'dist/v0/amp-stream-gallery-0.1.js': 9.51,
    'dist/v0/amp-story-auto-ads-0.1.js': 15.04,
    'dist/v0/amp-subscriptions-0.1.js': 19.87,
    'dist/v0/amp-timeago-0.1.js': 6.78,
    'dist/v0/amp-truncate-text-0.1.js': 3.92,
    'dist/v0/amp-timeago-1.0.js': 12.61,
    'dist/v0/amp-subscriptions-google-0.1.js': 37.34,
    'dist/v0/amp-date-picker-0.1.js': 118,
    'dist/v0/amp-story-0.1.js': 47.59,
    'dist/v0/amp-user-notification-0.1.js': 4.88,
    'dist/v0/amp-twitter-0.1.js': 6.32,
    'dist/v0/amp-video-0.1.js': 10.08,
    'dist/v0/amp-viewer-assistance-0.1.js': 2.58,
    'dist/v0/amp-video-iframe-0.1.js': 9.54,
    'dist/v0/amp-vine-0.1.js': 1.71,
    'dist/v0/amp-video-docking-0.1.js': 10.41,
    'dist/v0/amp-viewer-integration-0.1.js': 6.77,
    'dist/v0/amp-vk-0.1.js': 2.59,
    'dist/v0/amp-vimeo-0.1.js': 8.78,
    'dist/v0/amp-viqeo-player-0.1.js': 11.24,
    'dist/v0/amp-web-push-0.1.js': 6.8,
    'dist/v0/amp-wistia-player-0.1.js': 8.81,
    'dist/v0/amp-yotpo-0.1.js': 5.62,
    'dist/v0/amp-youtube-0.1.js': 9.73,
    'dist/v0/amp-story-1.0.js': 78.48,
    'dist/v0/amp-viz-vega-0.1.js': 139.78,
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
        bundleSizes: await getBrotliBundleSizes(),
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
          bundleSizes: await getBrotliBundleSizes(),
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

async function getLocalBundleSize() {
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
  await getBrotliBundleSizes();
}

async function bundleSize() {
  if (argv.on_skipped_build) {
    return await skipBundleSize();
  } else if (argv.on_push_build) {
    return await storeBundleSize();
  } else if (argv.on_pr_build) {
    return await reportBundleSize();
  } else if (argv.on_local_build) {
    return await getLocalBundleSize();
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
