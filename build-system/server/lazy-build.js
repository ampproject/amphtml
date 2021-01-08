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
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {
  doBuildExtension,
  maybeInitializeExtensions,
  getExtensionsToBuild,
} = require('../tasks/extension-helpers');
const {doBuildJs} = require('../tasks/helpers');
const {jsBundles} = require('../compile/bundles.config');

const extensionBundles = {};
maybeInitializeExtensions(extensionBundles, /* includeLatest */ true);

/**
 * Gets the unminified name of the bundle if it can be lazily built.
 *
 * @param {!Object} bundles
 * @param {string} name
 * @return {string}
 */
function maybeGetUnminifiedName(bundles, name) {
  if (argv.compiled) {
    for (const key of Object.keys(bundles)) {
      if (
        key == name ||
        (bundles[key].options && bundles[key].options.minifiedName == name)
      ) {
        return key;
      }
    }
  }
  return name;
}

/**
 * Checks for a previously triggered build for a bundle, and triggers one if
 * required.
 *
 * @param {string} url
 * @param {string} matcher
 * @param {!Object} bundles
 * @param {function()} buildFunc
 * @param {function()} next
 */
async function lazyBuild(url, matcher, bundles, buildFunc, next) {
  const match = url.match(matcher);
  if (match && match.length == 2) {
    const name = maybeGetUnminifiedName(bundles, match[1]);
    const bundle = bundles[name];
    if (bundle) {
      await build(bundles, name, buildFunc);
    }
  }
  next();
}

/**
 * Actually build a JS file or extension. Only will allow one build per
 * bundle at a time.
 *
 * @param {!Object} bundles
 * @param {string} name
 * @param {function()} buildFunc
 * @return {Promise|undefined}
 */
async function build(bundles, name, buildFunc) {
  const bundle = bundles[name];
  if (bundle.pendingBuild) {
    return await bundle.pendingBuild;
  }
  if (bundle.watched) {
    return;
  }
  bundle.watched = true;
  bundle.pendingBuild = buildFunc(bundles, name, {
    watch: true,
    minify: argv.compiled,
    onWatchBuild: async (bundlePromise) => {
      bundle.pendingBuild = bundlePromise;
      await bundlePromise;
      bundle.pendingBuild = undefined;
    },
  });
  await bundle.pendingBuild;
  bundle.pendingBuild = undefined;
}

/**
 * Lazy builds the correct version of an extension when requested.
 *
 * @param {!Object} req
 * @param {!Object} res
 * @param {function()} next
 */
async function lazyBuildExtensions(req, res, next) {
  const matcher = argv.compiled
    ? /\/dist\/v0\/([^\/]*)\.js/ // '/dist/v0/*.js'
    : /\/dist\/v0\/([^\/]*)\.max\.js/; // '/dist/v0/*.max.js'
  await lazyBuild(req.url, matcher, extensionBundles, doBuildExtension, next);
}

/**
 * Lazy builds a non-extension JS file when requested.
 *
 * @param {!Object} req
 * @param {!Object} res
 * @param {function()} next
 */
async function lazyBuildJs(req, res, next) {
  const matcher = /\/.*\/([^\/]*\.js)/;
  await lazyBuild(req.url, matcher, jsBundles, doBuildJs, next);
}

/**
 * Pre-builds the core runtime and the JS files that it loads.
 */
async function preBuildRuntimeFiles() {
  await build(jsBundles, 'amp.js', doBuildJs);
  await build(jsBundles, 'ww.max.js', doBuildJs);
}

/**
 * Pre-builds default extensions and ones requested via command line flags.
 */
async function preBuildExtensions() {
  const extensions = getExtensionsToBuild();
  for (const extensionBundle in extensionBundles) {
    const extension = extensionBundles[extensionBundle].name;
    if (extensions.includes(extension) && !extensionBundle.endsWith('latest')) {
      await build(extensionBundles, extensionBundle, doBuildExtension);
    }
  }
}

module.exports = {
  lazyBuildExtensions,
  lazyBuildJs,
  preBuildExtensions,
  preBuildRuntimeFiles,
};
