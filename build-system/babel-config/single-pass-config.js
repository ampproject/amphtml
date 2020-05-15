/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const {getPreClosureConfig} = require('./pre-closure-config');

/**
 * Gets the config for babel transforms run by the post compile step during
 * `gulp dist --single_pass`.
 *
 * @return {!Object}
 */
function getSinglePassPostConfig() {
  const singlePassPlugins = [
    './build-system/babel-plugins/babel-plugin-transform-prune-namespace',
  ];
  return {
    compact: false,
    inputSourceMap: false,
    plugins: singlePassPlugins,
    sourceMaps: true,
  };
}

/**
 * Gets the config for babel transforms run while building the dependency tree
 * during `gulp dist --single_pass`. Does so by creating a clone of the normal
 * pre-closure config, and adding an additional plugin.
 *
 * @return {!Object}
 */
function getSinglePassDepsConfig() {
  const singlePassDepsConfig = getPreClosureConfig();
  singlePassDepsConfig.plugins.push('transform-es2015-modules-commonjs');
  return singlePassDepsConfig;
}

module.exports = {
  getSinglePassDepsConfig,
  getSinglePassPostConfig,
};
