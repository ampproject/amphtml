/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

// These extensions have been modified in the last 2 weeks, so we're not
// including them yet to minimize disruption to devs actively working on them.
const EXCLUDED_EXTENSIONS = [
  'amp-ad-network-valueimpression-impl',
  'amp-ad',
  'amp-addthis',
  'amp-analytics',
  'amp-anim',
  'amp-apester-media',
  'amp-autocomplete',
  'amp-base-carousel',
  'amp-brightcove',
  'amp-carousel',
  'amp-connatix-player',
  'amp-consent',
  'amp-dailymotion',
  'amp-facebook-comments',
  'amp-facebook-like',
  'amp-facebook-page',
  'amp-facebook',
  'amp-fit-text',
  'amp-iframe',
  'amp-inline-gallery',
  'amp-lightbox',
  'amp-link',
  'amp-minute-media-player',
  'amp-mustache',
  'amp-nexxtv-player',
  'amp-recaptcha-input',
  'amp-render',
  'amp-sidebar',
  'amp-story-auto-ads',
  'amp-story',
  'amp-story',
  'amp-stream-gallery',
  'amp-subscriptions',
  'amp-tiktok',
  'amp-twitter',
  'amp-video',
];

module.exports = {
  'overrides': [
    {
      'files': EXCLUDED_EXTENSIONS.map((ext) => `./${ext}/**/*.js`),
      'rules': {'import/order': 0},
    },
  ],
};
