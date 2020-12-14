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

const log = require('fancy-log');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../common/ctrlcHandler');
const {
  displayLifecycleDebugging,
} = require('../compile/debug-compilation-lifecycle');
const {cleanupBuildDir, closureCompile} = require('../compile/compile');
const {compileCss} = require('./css');
const {extensions, maybeInitializeExtensions} = require('./extension-helpers');
const {maybeUpdatePackages} = require('./update-packages');

/**
 * Dedicated type check path.
 * @return {!Promise}
 */
async function checkTypes() {
  maybeUpdatePackages();
  const handlerProcess = createCtrlcHandler('check-types');
  process.env.NODE_ENV = 'production';
  cleanupBuildDir();
  maybeInitializeExtensions();
  const compileSrcs = [
    './src/amp.js',
    './src/amp-shadow.js',
    './src/inabox/amp-inabox.js',
    './ads/alp/install-alp.js',
    './ads/inabox/inabox-host.js',
    './src/web-worker/web-worker.js',
  ];
  const extensionValues = Object.keys(extensions).map(function (key) {
    return extensions[key];
  });
  const extensionSrcs = extensionValues
    .filter(function (extension) {
      return !extension.noTypeCheck;
    })
    .map(function (extension) {
      return (
        './extensions/' +
        extension.name +
        '/' +
        extension.version +
        '/' +
        extension.name +
        '.js'
      );
    })
    .sort();
  return compileCss()
    .then(() => {
      log('Checking types...');
      displayLifecycleDebugging();
      return Promise.all([
        closureCompile(
          compileSrcs.concat(extensionSrcs),
          './dist',
          'check-types.js',
          {
            include3pDirectories: true,
            includePolyfills: true,
            extraGlobs: ['src/inabox/*.js', '!node_modules/preact'],
            typeCheckOnly: true,
          }
        ),
        // Type check 3p/ads code.
        closureCompile(
          ['./3p/integration.js'],
          './dist',
          'integration-check-types.js',
          {
            externs: ['ads/ads.extern.js'],
            include3pDirectories: true,
            includePolyfills: true,
            typeCheckOnly: true,
          }
        ),
        closureCompile(
          ['./3p/ampcontext-lib.js'],
          './dist',
          'ampcontext-check-types.js',
          {
            externs: ['ads/ads.extern.js'],
            include3pDirectories: true,
            includePolyfills: true,
            typeCheckOnly: true,
          }
        ),
        closureCompile(
          ['./3p/iframe-transport-client-lib.js'],
          './dist',
          'iframe-transport-client-check-types.js',
          {
            externs: ['ads/ads.extern.js'],
            include3pDirectories: true,
            includePolyfills: true,
            typeCheckOnly: true,
          }
        ),
      ]);
    })
    .then(() => exitCtrlcHandler(handlerProcess));
}

module.exports = {
  checkTypes,
};

/* eslint "google-camelcase/google-camelcase": 0 */

checkTypes.description = 'Check source code for JS type errors';
checkTypes.flags = {
  closure_concurrency: '  Sets the number of concurrent invocations of closure',
  debug: '  Outputs the file contents during compilation lifecycles',
};
