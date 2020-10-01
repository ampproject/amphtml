/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview This file contains all the globs required for babel
 * transformation and for closure compilation. Try and maintain the glob
 * for both the babel and closure sources to be as close as possible.
 */

const COMMON_GLOBS = [
  'third_party/amp-toolbox-cache-url/**/*.js',
  'third_party/caja/html-sanitizer.js',
  'third_party/closure-library/sha384-generated.js',
  'third_party/css-escape/css-escape.js',
  'third_party/d3/**/*.js',
  'third_party/fuzzysearch/index.js',
  'third_party/inputmask/**/*.js',
  'third_party/mustache/**/*.js',
  'third_party/react-dates/bundle.js',
  'third_party/set-dom/set-dom.js',
  'third_party/subscriptions-project/*.js',
  'third_party/timeagojs/**/*.js',
  'third_party/vega/**/*.js',
  'third_party/webcomponentsjs/ShadowCSS.js',
  'third_party/zuho/**/*.js',
  'node_modules/dompurify/package.json',
  'node_modules/dompurify/dist/purify.es.js',
  'node_modules/intersection-observer/package.json',
  'node_modules/intersection-observer/intersection-observer.install.js',
  'node_modules/promise-pjs/package.json',
  'node_modules/promise-pjs/promise.mjs',
  'node_modules/rrule/dist/es5/rrule.min.js',
  'node_modules/web-animations-js/package.json',
  'node_modules/web-animations-js/web-animations.install.js',
  'node_modules/web-activities/package.json',
  'node_modules/web-activities/activity-ports.js',
  'node_modules/@ampproject/animations/package.json',
  'node_modules/@ampproject/animations/dist/animations.mjs',
  'node_modules/@ampproject/toolbox-cache-url/package.json',
  'node_modules/@ampproject/toolbox-cache-url/dist/amp-toolbox-cache-url.esm.js',
  'node_modules/@ampproject/viewer-messaging/package.json',
  'node_modules/@ampproject/viewer-messaging/messaging.js',
  'node_modules/@ampproject/worker-dom/package.json',
  'node_modules/@ampproject/worker-dom/dist/amp-production/main.mjs',
  'node_modules/preact/package.json',
  'node_modules/preact/dist/*.js',
  'node_modules/preact/hooks/package.json',
  'node_modules/preact/hooks/dist/*.js',
  'node_modules/preact/compat/package.json',
  'node_modules/preact/compat/dist/*.js',
];

/**
 * NOTE: Keep the globs here in sync with the `CLOSURE_SRC_GLOBS`.
 */
const BABEL_SRC_GLOBS = [
  'src/**/*.js',
  'builtins/**/*.js',
  'build/**/*.js',
  'extensions/**/*.js',
  '3p/**/*.js',
  'ads/**/*.js',
].concat(COMMON_GLOBS);

/**
 * NOTE: Keep the globs here in sync with the `BABEL_SRC_GLOBS`.
 */
const CLOSURE_SRC_GLOBS = [
  '3p/3p.js',
  // Ads config files.
  'ads/_*.js',
  'ads/alp/**/*.js',
  'ads/google/**/*.js',
  'ads/inabox/**/*.js',
  // Files under build/. Should be sparse.
  'build/*.css.js',
  'build/fake-module/**/*.js',
  'build/patched-module/**/*.js',
  'build/experiments/**/*.js',
  'build/parsers/**/*.js',
  // A4A has these cross extension deps.
  'extensions/amp-ad-network*/**/*-config.js',
  'extensions/amp-ad/**/*.js',
  'extensions/amp-a4a/**/*.js',
  // TODO(#24080) Remove this when story ads have full ad network support.
  // Needed for amp-story-auto-ads to validate amp-ad-exit config.
  'extensions/amp-ad-exit/**/*.js',
  // Currently needed for crypto.js and visibility.js.
  // Should consider refactoring.
  'extensions/amp-analytics/**/*.js',
  // Needed for WebAnimationService
  'extensions/amp-animation/**/*.js',
  // Needed for amp-carousel 0.2, amp-inline-gallery, amp-stream-gallery
  'extensions/amp-base-carousel/**/*.js',
  // For amp-bind in the web worker (ww.js).
  'extensions/amp-bind/**/*.js',
  // Needed to access to Variant interface from other extensions
  'extensions/amp-experiment/**/*.js',
  // Needed to access form impl from other extensions
  'extensions/amp-form/**/*.js',
  // Needed by amp-facebook-* for the loader logo
  'extensions/amp-facebook/0.1/facebook-loader.js',
  // Needed to access inputmask impl from other extensions
  'extensions/amp-inputmask/**/*.js',
  // Needed for AccessService
  'extensions/amp-access/**/*.js',
  // Needed for AmpStoryVariableService
  'extensions/amp-story/**/*.js',
  // Needed for SubscriptionsService
  'extensions/amp-subscriptions/**/*.js',
  // Needed to access UserNotificationManager from other extensions
  'extensions/amp-user-notification/**/*.js',
  // Needed for VideoService
  'extensions/amp-video-service/**/*.js',
  // Needed to access ConsentPolicyManager from other extensions
  'extensions/amp-consent/**/*.js',
  // Needed to access AmpGeo type for service locator
  'extensions/amp-geo/**/*.js',
  // Needed for amp-smartlinks dep on amp-skimlinks
  'extensions/amp-skimlinks/0.1/**/*.js',
  'src/*.js',
  'src/**/*.js',
  '!third_party/babel/custom-babel-helpers.js',
  // Exclude since it's not part of the runtime/extension binaries.
  '!extensions/amp-access/0.1/amp-login-done.js',
  'builtins/**.js',
  // 'node_modules/core-js/modules/**.js',
  // Not sure what these files are, but they seem to duplicate code
  // one level below and confuse the compiler.
  '!node_modules/core-js/modules/library/**.js',
].concat(COMMON_GLOBS);

/**
 * NOTE: 3p code is generally excluded from the transform process.
 * The globs here are force-transformed anyway.
 */
const THIRD_PARTY_TRANSFORM_GLOBS = [
  // JSX syntax should undergo usual transforms
];

module.exports = {
  BABEL_SRC_GLOBS,
  CLOSURE_SRC_GLOBS,
  THIRD_PARTY_TRANSFORM_GLOBS,
};
