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
    whitelist: 'extensions/amp-mustache/0.1/amp-mustache.js->' +
        'src/sanitizer.js',
  },
  {
    filesMatching: '**/*.js',
    mustNotDependOn: 'third_party/**/*.js',
    whitelist: [
      'extensions/amp-analytics/**/*.js->' +
          'third_party/closure-library/sha384-generated.js',
      'extensions/amp-mustache/0.1/amp-mustache.js->' +
          'third_party/mustache/mustache.js',
      '3p/polyfills.js->third_party/babel/custom-babel-helpers.js',
      'src/sanitizer.js->third_party/caja/html-sanitizer.js',
    ]
  },
  // Rules for 3p
  {
    filesMatching: '3p/**/*.js',
    mustNotDependOn: 'src/**/*.js',
    whitelist: [
      '3p/**->src/log.js',
      '3p/**->src/types.js',
      '3p/**->src/string.js',
      '3p/**->src/url.js',
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
      'ads/**->src/log.js',
      'ads/**->src/mode.js',
      'ads/**->src/url.js',
      // ads/google/a4a doesn't contain 3P ad code and should probably move
      // somewhere else at some point
      'ads/google/a4a/**->src/ad-cid.js',
      'ads/google/a4a/**->src/document-info.js',
      'ads/google/a4a/**->src/experiments.js',
      'ads/google/a4a/**->src/timer.js',
      'ads/google/a4a/**->src/viewer.js',
      'ads/google/a4a/**->src/viewport.js',
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
    ],
  },
  // Rules for extensions.
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/service/**/*.js',
  },
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/base-element.js',
  },
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/polyfills/**/*.js',
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
  {
    filesMatching: 'src/**/*.js',
    mustNotDependOn: '3p/**/*.js',
  },
];
