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

const extensions = {};
maybeInitializeExtensions(extensions, /* includeLatest */ true);

exports.lazyBuildExtensions = function(req, res, next) {
  const extensionUrlMatcher = /\/dist\/v0\/([^\/]*)\.max\.js/;
  const extensionMatch = req.url.match(extensionUrlMatcher);
  if (extensionMatch && extensionMatch.length == 2) {
    const extension = extensionMatch[1];
    if (extensions[extension] && !extensions[extension].watched) {
      return doBuildExtension(extensions, extension, {watch: true}).then(() => {
        extensions[extension].watched = true;
        next();
      });
    }
  }
  next();
};

exports.lazyBuildJs = function(req, res, next) {
  const jsUrlMatcher = /\/.*\/([^\/]*\.js)/;
  const jsMatch = req.url.match(jsUrlMatcher);
  if (jsMatch && jsMatch.length == 2) {
    const jsBundle = jsMatch[1];
    if (jsBundles[jsBundle] && !jsBundles[jsBundle].watched) {
      return doBuildJs(jsBundle, {watch: true}).then(() => {
        jsBundles[jsBundle].watched = true;
        next();
      });
    }
  }
  next();
};
