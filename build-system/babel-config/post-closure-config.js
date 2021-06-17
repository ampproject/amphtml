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

const argv = require('minimist')(process.argv.slice(2));

/**
 * Gets the config for post-closure babel transforms run during `amp dist`.
 *
 * @return {!Object}
 */
function getPostClosureConfig() {
  const postClosurePlugins = [
    argv.esm || argv.sxg
      ? './build-system/babel-plugins/babel-plugin-const-transformer'
      : null,
    argv.esm || argv.sxg
      ? './build-system/babel-plugins/babel-plugin-transform-remove-directives'
      : null,
    argv.esm || argv.sxg
      ? './build-system/babel-plugins/babel-plugin-transform-stringish-literals'
      : null,
    './build-system/babel-plugins/babel-plugin-transform-minified-comments',
  ].filter(Boolean);

  return {
    compact: false,
    inputSourceMap: false,
    plugins: postClosurePlugins,
    retainLines: false,
    sourceMaps: true,
  };
}

module.exports = {
  getPostClosureConfig,
};
