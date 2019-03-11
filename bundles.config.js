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
/* global exports, process, require */

const colors = require('ansi-colors');
const log = require('fancy-log');

/**
 * @enum {string}
 */
const TYPES = exports.TYPES = {
  AD: '_base_ad',
  MEDIA: '_base_media',
  MISC: '_base_misc',
};

exports.extensionBundles = [
  {
    name: 'amp-3d-gltf',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-3q-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-access',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-access-laterpay',
    version: ['0.1', '0.2'],
    latestVersion: '0.2',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-access-scroll',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-access-poool',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-accordion',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-action-macro',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-ad',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.AD,
  },
  {
    name: 'amp-ad-custom',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-ad-network-adsense-impl',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-ad-network-adzerk-impl',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-ad-network-doubleclick-impl',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-ad-network-fake-impl',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-ad-network-triplelift-impl',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-ad-network-cloudflare-impl',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-ad-network-gmossp-impl',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-ad-exit',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-addthis',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-analytics',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-anim',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-animation',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-apester-media',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-app-banner',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-audio',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-auto-ads',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
  {
    name: 'amp-autocomplete',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-auto-lightbox',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-base-carousel',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-beopinion',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-bind',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-bodymovin-animation',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-brid-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-delight-player',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-brightcove',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-byside-content',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-kaltura-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-call-tracking',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-carousel',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-consent',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-crypto-polyfill',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-dailymotion',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-date-countdown',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-date-display',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-google-document-embed',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-dynamic-css-classes',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-embedly-card',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-experiment',
    version: ['0.1', '1.0'],
    latestVersion: '1.0',
    type: TYPES.MISC,
  },
  {
    name: 'amp-facebook',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-facebook-comments',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-facebook-like',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-facebook-page',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-fit-text',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-font',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-form',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-fx-collection',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-fx-flying-carpet',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-geo',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-gfycat',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-gist',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-gwd-animation',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-hulu',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-iframe',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-ima-video',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-image-lightbox',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-image-slider',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-imgur',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-inputmask',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
    postPrepend: [
      'third_party/inputmask/bundle.js',
    ],
  },
  {
    name: 'amp-instagram',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-install-serviceworker',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-izlesene',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-jwplayer',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-lightbox',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-lightbox-gallery',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-list',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-live-list',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-mathml',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-mustache',
    version: ['0.1', '0.2'],
    latestVersion: '0.2',
    type: TYPES.MISC,
  },
  {
    name: 'amp-next-page',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-nexxtv-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-o2-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-ooyala-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-pinterest',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-playbuzz',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-reach-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-reddit',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-riddle-quiz',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-script',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-share-tracking',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-sidebar',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-skimlinks',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-smartlinks',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-soundcloud',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-springboard-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-sticky-ad',
    version: '1.0',
    latestVersion: '1.0',
    options: {hasCss: true},
    type: TYPES.AD,
  },
  {
    name: 'amp-story',
    version: '0.1',
    latestVersion: '1.0',
    options:
    {
      hasCss: true,
      cssBinaries: [
        'amp-story-bookend',
        'amp-story-consent',
        'amp-story-hint',
        'amp-story-unsupported-browser-layer',
        'amp-story-viewport-warning-layer',
        'amp-story-info-dialog',
        'amp-story-share',
        'amp-story-share-menu',
        'amp-story-system-layer',
      ],
    },
    type: TYPES.MISC,
  },
  {
    name: 'amp-story',
    version: '1.0',
    latestVersion: '1.0',
    options:
    {
      hasCss: true,
      cssBinaries: [
        'amp-story-bookend',
        'amp-story-tooltip',
        'amp-story-consent',
        'amp-story-hint',
        'amp-story-page-attachment-header',
        'amp-story-unsupported-browser-layer',
        'amp-story-viewport-warning-layer',
        'amp-story-info-dialog',
        'amp-story-share',
        'amp-story-share-menu',
        'amp-story-system-layer',
      ],
    },
    type: TYPES.MISC,
  },
  {
    name: 'amp-story-auto-ads',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-selector',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-web-push',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-wistia-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-position-observer',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-orientation-observer',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-date-picker',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
    postPrepend: [
      'third_party/react-dates/bundle.js',
    ],
  },
  {
    name: 'amp-image-viewer',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-subscriptions',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-subscriptions-google',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-pan-zoom',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-recaptcha-input',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  /**
   * @deprecated `amp-slides` is deprecated and will be deleted before 1.0.
   * Please see {@link AmpCarousel} with `type=slides` attribute instead.
   */
  {
    name: 'amp-slides',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-social-share',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-timeago',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-twitter',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-user-notification',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
  },
  {
    name: 'amp-vimeo',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-vine',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-viz-vega',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MISC,
    postPrepend: [
      'third_party/d3/d3.js',
      'third_party/d3-geo-projection/d3-geo-projection.js',
      'third_party/vega/vega.js',
    ],
  },
  {
    name: 'amp-google-vrview-image',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-viewer-assistance',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-viewer-integration',
    version: '0.1',
    latestVersion: '0.1',
    options:
    {
      // The viewer integration code needs to run asap, so that viewers
      // can influence document state asap. Otherwise the document may take
      // a long time to learn that it should start process other extensions
      // faster.
      loadPriority: 'high',
    },
    type: TYPES.MISC,
  },
  {
    name: 'amp-video',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-video-docking',
    version: '0.1',
    latestVersion: '0.1',
    options: {hasCss: true},
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-video-iframe',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-viqeo-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-vk',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-yotpo',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MISC,
  },
  {
    name: 'amp-youtube',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-mowplayer',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-powr-player',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.MEDIA,
  },
  {
    name: 'amp-mraid',
    version: '0.1',
    latestVersion: '0.1',
    type: TYPES.AD,
  },
];

exports.aliasBundles = [
  {
    name: 'amp-sticky-ad',
    version: '0.1',
    latestVersion: '1.0',
    options: {hasCss: true},
    type: 'ads',
  },
];

exports.altMainBundles = [
  {
    path: 'src/amp-shadow.js',
    name: 'shadow-v0',
    version: '0.1',
    latestVersion: '0.1',
  },
  {
    path: 'src/inabox/amp-inabox.js',
    name: 'amp4ads-v0',
    version: '0.1',
    latestVersion: '0.1',
  },
];

/**
 * @param {boolean} condition
 * @param {string} field
 * @param {string} message
 * @param {string} name
 * @param {string} found
 */
function verifyBundle_(condition, field, message, name, found) {
  if (!condition) {
    log(colors.red('ERROR:'),
        colors.cyan(field), message, colors.cyan(name),
        '\n' + found);
    process.exit(1);
  }
}

exports.verifyExtensionBundles = function() {
  exports.extensionBundles.forEach(bundle => {
    const bundleString = JSON.stringify(bundle, null, 2);
    verifyBundle_(
        'name' in bundle,
        'name', 'is missing from', '', bundleString);
    verifyBundle_(
        'version' in bundle,
        'version', 'is missing from', bundle.name, bundleString);
    verifyBundle_(
        'latestVersion' in bundle,
        'latestVersion', 'is missing from', bundle.name, bundleString);
    const duplicates = exports.extensionBundles.filter(
        duplicate => duplicate.name === bundle.name);
    verifyBundle_(
        duplicates.every(
            duplicate => duplicate.latestVersion === bundle.latestVersion),
        'latestVersion', 'is not the same for all versions of', bundle.name,
        JSON.stringify(duplicates, null, 2));
    verifyBundle_(
        'type' in bundle,
        'type', 'is missing from', bundle.name, bundleString);
    const validTypes = Object.keys(TYPES).map(x => TYPES[x]);
    verifyBundle_(
        validTypes.some(validType => validType === bundle.type),
        'type', `is not one of ${validTypes.join(',')} in`, bundle.name,
        bundleString);
  });
};

exports.verifyExtensionAliasBundles = function() {
  exports.aliasBundles.forEach(bundle => {
    const bundleString = JSON.stringify(bundle, null, 2);
    verifyBundle_(
        'name' in bundle,
        'name', 'is missing from', '', bundleString);
    verifyBundle_(
        'version' in bundle,
        'version', 'is missing from', bundle.name, bundleString);
    verifyBundle_(
        'latestVersion' in bundle,
        'latestVersion', 'is missing from', bundle.name, bundleString);
  });
};
