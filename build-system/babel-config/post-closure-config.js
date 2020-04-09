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
 * Gets the config for post-closure babel transforms run during `gulp dist --esm`.
 *
 * @return {!Object}
 */
function getPostClosureConfig() {
  if (!argv.esm) {
    return {};
  }

  const reactJsxPlugin = [
    '@babel/plugin-transform-react-jsx',
    {
      pragma: 'Preact.createElement',
      pragmaFrag: 'Preact.Fragment',
      useSpread: true,
    },
  ];
  const postClosurePlugins = [
    './build-system/babel-plugins/babel-plugin-transform-minified-comments',
    './build-system/babel-plugins/babel-plugin-const-transformer',
    './build-system/babel-plugins/babel-plugin-transform-remove-directives',
    './build-system/babel-plugins/babel-plugin-transform-function-declarations',
    './build-system/babel-plugins/babel-plugin-transform-stringish-literals',
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    '@babel/plugin-transform-react-constant-elements',
    reactJsxPlugin,
  ];
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: false,
      targets: {'esmodules': true},
    },
  ];
  const postClosurePresets = [presetEnv];
  return {
    compact: false,
    inputSourceMap: false,
    plugins: postClosurePlugins,
    presets: postClosurePresets,
    retainLines: false,
    sourceMaps: true,
  };
}

module.exports = {
  getPostClosureConfig,
};
