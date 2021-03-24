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
const {compileJsWithEsbuild} = require('./helpers');
const {endBuildStep} = require('./helpers');
const {red, cyan} = require('kleur/colors');
const {VERSION} = require('../compile/internal-version');
const {watchDebounceDelay} = require('./helpers');
const {watch} = require('chokidar');

const SRCPATH = ['3p/vendors/*.js'];

/**
 * Entry point for 'amp ad-vendor-configs'
 * Compile all the vendor configs and drop in the dist folder
 * @param {!Object} options
 * @return {!Promise}
 */
async function buildVendorConfigs(options) {
  options = options || {};

  const destPath = 'dist.3p/';

  if (options.watch) {
    // Do not set watchers again when we get called by the watcher.
    const copyOptions = {...options, watch: false, calledByWatcher: true};
    const watchFunc = () => {
      buildVendorConfigs(copyOptions);
    };
    watch(SRCPATH).on('change', debounce(watchFunc, watchDebounceDelay));
  }

  const startTime = Date.now();
  const bundles = generateBundles();

  await Promise.all(
    Object.values(bundles).map((bundle) =>
      compileJsWithEsbuild(
        bundle.srcDir,
        bundle.srcFilename,
        options.minify ? bundle.minifiedDestDir : bundle.destDir,
        {...bundle.options, ...options}
      )
    )
  );

  endBuildStep(
    (options.minify ? 'Minified' : 'Compiled') +
      ' all 3p iframe vendor configs into',
    destPath,
    startTime
  );
}

/**
 * Build the JavaScript for the vendor specified for lazy building.
 *
 * @param {!Object} jsBundles
 * @param {string} name
 * @param {?Object} options
 * @return {!Promise}
 */
async function doBuild3pVendor(jsBundles, name, options) {
  const target = jsBundles[name];
  if (target) {
    return compileJsWithEsbuild(
      target.srcDir,
      target.srcFilename,
      options.minify ? target.minifiedDestDir : target.destDir,
      {...target.options, ...options}
    );
  } else {
    return Promise.reject(
      [red('Error:'), 'Could not find', cyan(name)].join(' ')
    );
  }
}

/**
 * Generate bundles for all 3p vendors to be built.
 * @return {Object}
 */
function generateBundles() {
  const bundles = {};
  listVendors().forEach((vendor) => {
    bundles[`${vendor}`] = {
      srcDir: './3p/vendors/',
      srcFilename: `${vendor}.js`,
      destDir: './dist.3p/current/vendor/',
      minifiedDestDir: `./dist.3p/${VERSION}/vendor/`,
      options: {
        include3pDirectories: true,
        includePolyfills: true,
        externs: ['./ads/ads.extern.js'],
        toName: `${vendor}.max.js`,
        minifiedName: `${vendor}.js`,
      },
    };
  });
  return bundles;
}

/**
 * Return all 3p iframe vendors' names.
 * @return {!Array<string>}
 */
function listVendors() {
  const filesToBuild = globby.sync(SRCPATH);
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
    results.push(name);
  }
  return results;
}

module.exports = {
  buildVendorConfigs,
  doBuild3pVendor,
  generateBundles,
};
