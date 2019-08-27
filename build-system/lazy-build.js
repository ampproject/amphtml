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
const {
  doBuildExtension,
  maybeInitializeExtensions,
} = require('./tasks/extension-helpers');
const {doBuildJs} = require('./tasks/helpers');
const {jsBundles} = require('../bundles.config');

const extensionBundles = {};
maybeInitializeExtensions(extensionBundles, /* includeLatest */ true);

/**
 * @param {string} url
 * @param {string} matcher
 * @param {!Object} bundles
 * @param {function()} buildFunc
 * @param {function()} next
 */
async function lazyBuild(url, matcher, bundles, buildFunc, next) {
  const match = url.match(matcher);
  if (match && match.length == 2) {
    const bundle = match[1];
    if (bundles[bundle] && !bundles[bundle].watched) {
      if (bundles[bundle].pendingBuild) {
        await bundles[bundle].pendingBuild;
      } else {
        bundles[bundle].pendingBuild = buildFunc(bundles, bundle, {
          watch: true,
        });
        await bundles[bundle].pendingBuild;
        bundles[bundle].pendingBuild = undefined;
        bundles[bundle].watched = true;
      }
    }
  }
  next();
}

exports.lazyBuildExtensions = async function(req, res, next) {
  const matcher = /\/dist\/v0\/([^\/]*)\.max\.js/;
  await lazyBuild(req.url, matcher, extensionBundles, doBuildExtension, next);
};

exports.lazyBuildJs = async function(req, res, next) {
  const matcher = /\/.*\/([^\/]*\.js)/;
  await lazyBuild(req.url, matcher, jsBundles, doBuildJs, next);
};
