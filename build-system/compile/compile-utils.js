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

exports.SRC_GLOBS = [
  'src/**/*.js',
  'builtins/**/*.js',
  'build/**/*.js',
  'extensions/**/*.js',
  '3p/**/*.js',
  'ads/**/*.js',
  'build/*.css.js',
  'build/fake-module/**/*.js',
  'build/patched-module/**/*.js',
  'build/experiments/**/*.js',
  'node_modules/dompurify/dist/purify.es.js',
  'node_modules/promise-pjs/promise.js',
  'node_modules/rrule/dist/esm/src/index.js',
  'node_modules/set-dom/src/**/*.js',
  'node_modules/web-animations-js/web-animations.install.js',
  'node_modules/web-activities/activity-ports.js',
  'node_modules/@ampproject/animations/dist/animations.mjs',
  'node_modules/@ampproject/worker-dom/dist/amp/main.mjs',
  'node_modules/document-register-element/build/' +
    'document-register-element.patched.js',
  'third_party/caja/html-sanitizer.js',
  'third_party/closure-library/sha384-generated.js',
  'third_party/css-escape/css-escape.js',
  'third_party/fuzzysearch/index.js',
  'third_party/mustache/**/*.js',
  'third_party/timeagojs/**/*.js',
  'third_party/vega/**/*.js',
  'third_party/d3/**/*.js',
  'third_party/subscriptions-project/*.js',
  'third_party/webcomponentsjs/ShadowCSS.js',
  'third_party/react-dates/bundle.js',
  'third_party/amp-toolbox-cache-url/**/*.js',
  'third_party/inputmask/**/*.js',
];


// Since we no longer pass the process_common_js_modules flag to closure
// compiler, we must now tranform these common JS node_modules to ESM before
// passing them to closure.
// TODO(rsimha, erwinmombay): Derive this list programmatically if possible.
const commonJsModules = [
  'node_modules/dompurify/',
  'node_modules/promise-pjs/',
  'node_modules/set-dom/',
];

/**
 * Returns true if the file is known to be a common JS module.
 * @param {string} file
 */
exports.isCommonJsModule = function(file) {
  return commonJsModules.some(function(module) {
    return file.startsWith(module);
  });
}
