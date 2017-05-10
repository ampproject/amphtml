/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

/**
 * - type - Is assumed to be "forbidden" if not provided.
 * - filesMatching - Is assumed to be all files if not provided.
 * - mustNotDependOn - If type is "forbidden" (default) then the files
 *     matched must not match the glob(s) provided.
 * - whitelist - Skip rule if this particular dependency is found.
 *     Syntax: fileAGlob->fileB where -> reads "depends on"
 * @typedef {{
 *   type: (string|undefined),
 *   filesMatching: (string|!Array<string>|undefined),
 *   mustNotDependOn: (string|!Array<string>|undefined),
 *   whitelist: (string|!Array<string>|undefined),
 * }}
 */
var RuleConfigDef;

// It is often OK to add things to the whitelist, but make sure to highlight
// this in review.
exports.rules = [
  // Global rules
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/sanitizer.js',
    whitelist: [
      'extensions/amp-mustache/0.1/amp-mustache.js->src/sanitizer.js',
      'extensions/amp-bind/0.1/bind-impl.js->src/sanitizer.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'third_party/**/*.js',
    whitelist: [
      'extensions/amp-crypto-polyfill/**/*.js->' +
          'third_party/closure-library/sha384-generated.js',
      'extensions/amp-mustache/0.1/amp-mustache.js->' +
          'third_party/mustache/mustache.js',
      'extensions/amp-timeago/0.1/amp-timeago.js->' +
          'third_party/timeagojs/timeago.js',
      '3p/polyfills.js->third_party/babel/custom-babel-helpers.js',
      'src/sanitizer.js->third_party/caja/html-sanitizer.js',
      'extensions/amp-viz-vega/**->third_party/vega/vega.js',
      'extensions/amp-viz-vega/**->third_party/d3/d3.js',
      'src/dom.js->third_party/css-escape/css-escape.js',
      'src/shadow-embed.js->third_party/webcomponentsjs/ShadowCSS.js',
      'third_party/timeagojs/timeago.js->' +
          'third_party/timeagojs/timeago-locales.js',
    ],
  },
  // Rules for 3p
  {
    filesMatching: '3p/**/*.js',
    mustNotDependOn: 'src/**/*.js',
    whitelist: [
      '3p/**->src/utils/object.js',
      '3p/**->src/log.js',
      '3p/**->src/types.js',
      '3p/**->src/string.js',
      '3p/**->src/style.js',
      '3p/**->src/url.js',
      '3p/**->src/config.js',
      '3p/**->src/mode.js',
      '3p/**->src/json.js',
      '3p/**->src/3p-frame-messaging.js',
      '3p/**->src/observable.js',
      '3p/polyfills.js->src/polyfills/math-sign.js',
      '3p/polyfills.js->src/polyfills/object-assign.js',
    ],
  },
  {
    filesMatching: '3p/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
  },
  // Rules for ads
  {
    filesMatching: 'ads/**/*.js',
    mustNotDependOn: 'src/**/*.js',
    whitelist: [
      'ads/**->src/utils/base64.js',
      'ads/**->src/utils/dom-fingerprint.js',
      'ads/**->src/utils/object.js',
      'ads/**->src/log.js',
      'ads/**->src/mode.js',
      'ads/**->src/url.js',
      'ads/**->src/types.js',
      'ads/**->src/string.js',
      'ads/**->src/style.js',
      // ads/google/a4a doesn't contain 3P ad code and should probably move
      // somewhere else at some point
      'ads/google/a4a/**->src/ad-cid.js',
      'ads/google/a4a/**->src/dom.js',
      'ads/google/a4a/**->src/experiments.js',
      'ads/google/a4a/**->src/services.js',
      'ads/google/a4a/performance.js->src/services.js',
      'ads/google/a4a/performance.js->src/service/variable-source.js',
      'ads/google/a4a/performance.js->src/common-signals.js',
      'ads/google/a4a/performance.js->src/analytics.js',
      // alp handler needs to depend on src files
      'ads/alp/handler.js->src/dom.js',
      'ads/alp/handler.js->src/config.js',
      // Some ads need to depend on json.js
      'ads/**->src/json.js',
    ],
  },
  {
    filesMatching: 'ads/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
    whitelist: [
      // See todo note in ads/_a4a-config.js
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config.js',
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-doubleclick-impl/0.1/' +
          'doubleclick-a4a-config.js',
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-fake-impl/0.1/fake-a4a-config.js',
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-triplelift-impl/0.1/triplelift-a4a-config.js',
      'ads/_a4a-config.js->' +
          'extensions/amp-ad-network-cloudflare-impl/0.1/cloudflare-a4a-config.js',
      'ads/google/a4a/google-data-reporter.js->' +
          'extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config.js',
      'ads/google/a4a/google-data-reporter.js->' +
          'extensions/amp-ad-network-doubleclick-impl/0.1/' +
          'doubleclick-a4a-config.js',
      'ads/google/a4a/performance.js->extensions/amp-a4a/0.1/amp-a4a.js',
    ],
  },
  // Rules for extensions and main src.
  {
    filesMatching: '{src,extensions}/**/*.js',
    mustNotDependOn: '3p/**/*.js',
  },

  // Rules for extensions.
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/service/**/*.js',
    whitelist: [
      'extensions/amp-a4a/0.1/a4a-variable-source.js->' +
          'src/service/variable-source.js',
      'extensions/amp-a4a/0.1/amp-a4a.js->' +
          'src/service/url-replacements-impl.js',
      'extensions/amp-video/0.1/amp-video.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-ooyala-player/0.1/amp-ooyala-player.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-youtube/0.1/amp-youtube.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-brid-player/0.1/amp-brid-player.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-a4a/0.1/amp-a4a.js->src/service/variable-source.js',
      'extensions/amp-nexxtv-player/0.1/amp-nexxtv-player.js->' +
          'src/service/video-manager-impl.js',
      'extensions/amp-3q-player/0.1/amp-3q-player.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-ima-video/0.1/amp-ima-video.js->' +
        'src/service/video-manager-impl.js',
      'extensions/amp-fx-parallax/0.1/amp-fx-parallax.js->' +
          'src/service/parallax-impl.js',
      // TODO(@zhouyx, #9213) Remove this item.
      'extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler.js->' +
          'src/service/position-observer-impl.js',
      'extensions/amp-animation/0.1/scrollbound-scene.js->' +
          'src/service/position-observer-impl.js',
    ],
  },
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/base-element.js',
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/polyfills/**/*.js',
    whitelist: [
      // DO NOT add extensions/ files
      '3p/polyfills.js->src/polyfills/math-sign.js',
      '3p/polyfills.js->src/polyfills/object-assign.js',
      'src/polyfills.js->src/polyfills/domtokenlist-toggle.js',
      'src/polyfills.js->src/polyfills/document-contains.js',
      'src/polyfills.js->src/polyfills/math-sign.js',
      'src/polyfills.js->src/polyfills/object-assign.js',
      'src/polyfills.js->src/polyfills/promise.js',
      'src/polyfills.js->src/polyfills/array-includes.js',
      'src/service/extensions-impl.js->src/polyfills/document-contains.js',
      'src/service/extensions-impl.js->src/polyfills/domtokenlist-toggle.js',
    ],
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'src/polyfills.js',
    whitelist: [
      'src/amp.js->src/polyfills.js',
      'src/service.js->src/polyfills.js',
      'src/service/timer-impl.js->src/polyfills.js',
      'src/service/extensions-impl.js->src/polyfills.js',
    ],
  },

  // Rules for main src.
  {
    filesMatching: 'src/**/*.js',
    mustNotDependOn: 'extensions/**/*.js',
  },
  {
    filesMatching: 'src/**/*.js',
    mustNotDependOn: 'ads/**/*.js',
    whitelist: 'src/ad-cid.js->ads/_config.js',
  },

  // A4A
  {
    filesMatching: 'extensions/**/*-ad-network-*.js',
    mustNotDependOn: [
      'extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler.js',
      'extensions/amp-ad/0.1/concurrent-load.js',
      'src/3p-frame.js',
      'src/iframe-helper.js',
    ],
  },
];
