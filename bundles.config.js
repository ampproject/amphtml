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
/* global exports */

exports.extensionBundles = [
  {name: 'amp-3d-gltf', version: '0.1'},
  {name: 'amp-3q-player', version: '0.1'},
  {name: 'amp-access', version: '0.1', options: {hasCss: true}},
  {
    name: 'amp-access-laterpay',
    version: ['0.1', '0.2'],
    options: {hasCss: true},
  },
  {name: 'amp-access-scroll', version: '0.1', options: {hasCss: true}},
  {name: 'amp-accordion', version: '0.1'},
  {name: 'amp-ad', version: '0.1', options: {hasCss: true}},
  {name: 'amp-ad-network-adsense-impl', version: '0.1'},
  {name: 'amp-ad-network-adzerk-impl', version: '0.1'},
  {name: 'amp-ad-network-doubleclick-impl', version: '0.1'},
  {name: 'amp-ad-network-fake-impl', version: '0.1'},
  {name: 'amp-ad-network-triplelift-impl', version: '0.1'},
  {name: 'amp-ad-network-cloudflare-impl', version: '0.1'},
  {name: 'amp-ad-network-gmossp-impl', version: '0.1'},
  {name: 'amp-ad-exit', version: '0.1'},
  {name: 'amp-addthis', version: '0.1'},
  {name: 'amp-analytics', version: '0.1'},
  {name: 'amp-anim', version: '0.1'},
  {name: 'amp-animation', version: '0.1'},
  {name: 'amp-apester-media', version: '0.1', options: {hasCss: true}},
  {name: 'amp-app-banner', version: '0.1', options: {hasCss: true}},
  {name: 'amp-audio', version: '0.1'},
  {name: 'amp-auto-ads', version: '0.1'},
  {name: 'amp-beopinion', version: '0.1'},
  {name: 'amp-bind', version: '0.1'},
  {
    name: 'amp-bodymovin-animation',
    version: '0.1',
    options: {hasCss: false},
  },
  {name: 'amp-brid-player', version: '0.1'},
  {name: 'amp-brightcove', version: '0.1'},
  {name: 'amp-byside-content', version: '0.1', options: {hasCss: true}},
  {name: 'amp-kaltura-player', version: '0.1'},
  {name: 'amp-call-tracking', version: '0.1'},
  {name: 'amp-carousel', version: '0.1', options: {hasCss: true}},
  {name: 'amp-compare-slider', version: '0.1'},
  {name: 'amp-consent', version: '0.1', options: {hasCss: true}},
  {name: 'amp-crypto-polyfill', version: '0.1'},
  {name: 'amp-dailymotion', version: '0.1'},
  {name: 'amp-date-countdown', version: '0.1'},
  {name: 'amp-google-document-embed', version: '0.1'},
  {name: 'amp-dynamic-css-classes', version: '0.1'},
  {name: 'amp-experiment', version: '0.1'},
  {name: 'amp-facebook', version: '0.1'},
  {name: 'amp-facebook-comments', version: '0.1'},
  {name: 'amp-facebook-like', version: '0.1'},
  {name: 'amp-facebook-page', version: '0.1'},
  {name: 'amp-fit-text', version: '0.1', options: {hasCss: true}},
  {name: 'amp-font', version: '0.1'},
  {name: 'amp-form', version: '0.1', options: {hasCss: true}},
  {name: 'amp-fx-collection', version: '0.1'},
  {
    name: 'amp-fx-flying-carpet',
    version: '0.1',
    options: {hasCss: true},
  },
  {name: 'amp-geo', version: '0.1'},
  {name: 'amp-gfycat', version: '0.1'},
  {name: 'amp-gist', version: '0.1'},
  {name: 'amp-gwd-animation', version: '0.1', options: {hasCss: true}},
  {name: 'amp-hulu', version: '0.1'},
  {name: 'amp-iframe', version: '0.1'},
  {name: 'amp-ima-video', version: '0.1'},
  {name: 'amp-image-lightbox', version: '0.1', options: {hasCss: true}},
  {name: 'amp-imgur', version: '0.1'},
  {name: 'amp-instagram', version: '0.1', options: {hasCss: true}},
  {name: 'amp-install-serviceworker', version: '0.1'},
  {name: 'amp-izlesene', version: '0.1'},
  {name: 'amp-jwplayer', version: '0.1'},
  {name: 'amp-lightbox', version: '0.1', options: {hasCss: true}},
  {
    name: 'amp-lightbox-gallery',
    version: '0.1',
    options: {hasCss: true},
  },
  {name: 'amp-list', version: '0.1'},
  {name: 'amp-live-list', version: '0.1', options: {hasCss: true}},
  {name: 'amp-mathml', version: '0.1', options: {hasCss: true}},
  {name: 'amp-mustache', version: ['0.1', '0.2']},
  {name: 'amp-next-page', version: '0.1', options: {hasCss: true}},
  {name: 'amp-nexxtv-player', version: '0.1'},
  {name: 'amp-o2-player', version: '0.1'},
  {name: 'amp-ooyala-player', version: '0.1'},
  {name: 'amp-pinterest', version: '0.1', options: {hasCss: true}},
  {name: 'amp-playbuzz', version: '0.1', options: {hasCss: true}},
  {name: 'amp-reach-player', version: '0.1'},
  {name: 'amp-reddit', version: '0.1'},
  {name: 'amp-riddle-quiz', version: '0.1'},
  {name: 'amp-share-tracking', version: '0.1'},
  {name: 'amp-sidebar', version: '0.1', options: {hasCss: true}},
  {name: 'amp-soundcloud', version: '0.1'},
  {name: 'amp-springboard-player', version: '0.1'},
  {name: 'amp-sticky-ad', version: '1.0', options: {hasCss: true}},
  {
    name: 'amp-story',
    version: ['0.1', '1.0'],
    options: {
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
  },
  {name: 'amp-story-auto-ads', version: '0.1', options: {hasCss: true}},
  {name: 'amp-selector', version: '0.1', options: {hasCss: true}},
  {name: 'amp-web-push', version: '0.1', options: {hasCss: true}},
  {name: 'amp-wistia-player', version: '0.1'},
  {name: 'amp-position-observer', version: '0.1'},
  {name: 'amp-orientation-observer', version: '0.1'},
  {name: 'amp-date-picker', version: '0.1', options: {hasCss: true}},
  {name: 'amp-image-viewer', version: '0.1', options: {hasCss: true}},
  {name: 'amp-subscriptions', version: '0.1', options: {hasCss: true}},
  {
    name: 'amp-subscriptions-google',
    version: '0.1',
    options: {hasCss: true},
  },
  {name: 'amp-pan-zoom', version: '0.1', options: {hasCss: true}},
  /**
   * @deprecated `amp-slides` is deprecated and will be deleted before 1.0.
   * Please see {@link AmpCarousel} with `type=slides` attribute instead.
   */
  {name: 'amp-slides', version: '0.1'},
  {name: 'amp-social-share', version: '0.1', options: {hasCss: true}},
  {name: 'amp-timeago', version: '0.1'},
  {name: 'amp-twitter', version: '0.1'},
  {
    name: 'amp-user-notification',
    version: '0.1',
    options: {hasCss: true},
  },
  {name: 'amp-vimeo', version: '0.1'},
  {name: 'amp-vine', version: '0.1'},
  {name: 'amp-viz-vega', version: '0.1', options: {hasCss: true}},
  {name: 'amp-google-vrview-image', version: '0.1'},
  {
    name: 'amp-viewer-integration',
    version: '0.1',
    options: {
      // The viewer integration code needs to run asap, so that viewers
      // can influence document state asap. Otherwise the document may take
      // a long time to learn that it should start process other extensions
      // faster.
      loadPriority: 'high',
    },
  },
  {name: 'amp-video', version: '0.1'},
  {
    name: 'amp-video-service',
    version: '0.1',
    options: {
      // `amp-video-service` provides analytics and autoplay for all videos. We
      // need those to be available asap. This service replaces a runtime-level
      // provider, so loadPriority is set to high in lieu of delivering it as
      // part of the core binary.
      loadPriority: 'high',
    },
  },
  {name: 'amp-vk', version: '0.1'},
  {name: 'amp-yotpo', version: '0.1'},
  {name: 'amp-youtube', version: '0.1'},
];

exports.aliasBundles = [
  {
    name: 'amp-sticky-ad',
    version: '0.1',
    latestVersion: '1.0',
    options: {hasCss: true},
  },
];

exports.extensionBundles.forEach(c => {
  console./*OK*/assert('name' in c, 'name key must exist');
  console./*OK*/assert('version' in c, 'version key must exist');
});
exports.aliasBundles.forEach(c => {
  console./*OK*/assert('name' in c, 'name key must exist');
  console./*OK*/assert('version' in c, 'version key must exist');
  console./*OK*/assert('latestVersion' in c, 'latestVersion key must exist');
});
