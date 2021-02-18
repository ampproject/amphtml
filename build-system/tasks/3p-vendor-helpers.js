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

const debounce = require('debounce');
const globby = require('globby');
const {compileJs} = require('./helpers');
const {endBuildStep} = require('./helpers');
const {VERSION} = require('../compile/internal-version');
const {watchDebounceDelay} = require('./helpers');
const {watch} = require('chokidar');

/**
 * Entry point for 'gulp ad-vendor-configs'
 * Compile all the vendor configs and drop in the dist folder
 * @param {!Object} options
 * @return {!Promise}
 */
async function buildVendorConfigs(options) {
  options = options || {};

  const srcPath = ['3p/vendors/*.js'];
  const destPath = 'dist.3p/';

  // ignore test JS if not fortesting or build.
  if (!options.fortesting) {
    srcPath.push('!3p/vendors/_ping_.js');
  }

  if (options.watch) {
    // Do not set watchers again when we get called by the watcher.
    const copyOptions = {...options, watch: false, calledByWatcher: true};
    const watchFunc = () => {
      buildVendorConfigs(copyOptions);
    };
    watch(srcPath).on('change', debounce(watchFunc, watchDebounceDelay));
  }

  const startTime = Date.now();

  const filesToBuild = globby.sync(srcPath);
  const srcMatcher = /^3p\/vendors\/(.*)\.js/;
  const results = [];

  for (const index in filesToBuild) {
    const src = filesToBuild[index];
    const match = src.match(srcMatcher);
    if (!match || match.length != 2) {
      throw new Error(`${src} is not a valid 3p vendor path`);
    }

    // Extract vendor file name
    const name = match[1];
    results.push(buildVendor(name, options));
  }
  await Promise.all(results);

  endBuildStep(
    (options.minify ? 'Minified' : 'Compiled') +
      ' all 3p iframe vendor configs into',
    destPath,
    startTime
  );
}

/**
 * Build the JavaScript for the vendor specified
 *
 * @param {string} name Name of the extension. Must be the sub directory in
 *     the extensions directory and the name of the JS and optional CSS file.
 * @param {!Object} options
 * @return {!Promise}
 */
async function buildVendor(name, options) {
  await compileJs(
    './3p/vendors/',
    name + '.js',
    './dist.3p/',
    Object.assign(options, {
      include3pDirectories: true,
      includePolyfills: true,
      externs: ['./ads/ads.extern.js'],
      toName: `current/vendor/${name}.max.js`,
      minifiedName: `${VERSION}/vendor/${name}.js`,
      esmPassCompilation: false,
    })
  );

  // If an incremental watch build fails, simply return.
  if (options.errored) {
    return;
  }
}

module.exports = {
  buildVendorConfigs,
};
