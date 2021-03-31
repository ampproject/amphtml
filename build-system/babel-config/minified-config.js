/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {getReplacePlugin} = require('./helpers');

/**
 * Gets the config for minified babel transforms run, used by 3p vendors.
 *
 * @return {!Object}
 */
function getMinifiedConfig() {
  const replacePlugin = getReplacePlugin();
  const reactJsxPlugin = [
    '@babel/plugin-transform-react-jsx',
    {
      pragma: 'Preact.createElement',
      pragmaFrag: 'Preact.Fragment',
      useSpread: true,
    },
  ];

  const plugins = [
    'optimize-objstr',
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    './build-system/babel-plugins/babel-plugin-transform-promise-resolve',
    '@babel/plugin-transform-react-constant-elements',
    reactJsxPlugin,
    argv.esm
      ? './build-system/babel-plugins/babel-plugin-transform-dev-methods'
      : null,
    [
      './build-system/babel-plugins/babel-plugin-transform-log-methods',
      {replaceCallArguments: false},
    ],
    './build-system/babel-plugins/babel-plugin-transform-parenthesize-expression',
    [
      './build-system/babel-plugins/babel-plugin-transform-json-import',
      {freeze: false},
    ],
    './build-system/babel-plugins/babel-plugin-is_minified-constant-transformer',
    './build-system/babel-plugins/babel-plugin-transform-html-template',
    './build-system/babel-plugins/babel-plugin-transform-jss',
    './build-system/babel-plugins/babel-plugin-transform-version-call',
    './build-system/babel-plugins/babel-plugin-transform-simple-array-destructure',
    './build-system/babel-plugins/babel-plugin-transform-default-assignment',
    replacePlugin,
    './build-system/babel-plugins/babel-plugin-transform-amp-asserts',
    // TODO(erwinm, #28698): fix this in fixit week
    // argv.esm
    //? './build-system/babel-plugins/babel-plugin-transform-function-declarations'
    //: null,
    argv.fortesting
      ? null
      : './build-system/babel-plugins/babel-plugin-transform-json-configuration',
    argv.fortesting
      ? null
      : [
          './build-system/babel-plugins/babel-plugin-amp-mode-transformer',
          {isEsmBuild: !!argv.esm},
        ],
    argv.fortesting
      ? null
      : './build-system/babel-plugins/babel-plugin-is_dev-constant-transformer',
  ].filter(Boolean);
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: false,
      targets: argv.esm ? {esmodules: true} : {ie: 11, chrome: 41},
    },
  ];
  return {
    compact: false,
    plugins,
    presets: [presetEnv],
    retainLines: true,
  };
}

module.exports = {
  getMinifiedConfig,
};
