/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
const {getReplacePlugin} = require('./replace-plugin');

/**
 * Gets the config for pre-closure babel transforms run during `gulp dist`.
 *
 * @return {!Object}
 */
function getPreClosureConfig() {
  const isCheckTypes = argv._.includes('check-types');
  const filterImportsPlugin = [
    'filter-imports',
    {
      imports: {
        // Imports removed for all ESM builds.
        './polyfills/document-contains': ['installDocContains'],
        './polyfills/domtokenlist': ['installDOMTokenList'],
        './polyfills/fetch': ['installFetch'],
        './polyfills/math-sign': ['installMathSign'],
        './polyfills/object-assign': ['installObjectAssign'],
        './polyfills/object-values': ['installObjectValues'],
        './polyfills/promise': ['installPromise'],
        './polyfills/array-includes': ['installArrayIncludes'],
        './ie-media-bug': ['ieMediaCheckAndFix'],
        '../third_party/css-escape/css-escape': ['cssEscape'],
        // Imports that are not needed for valid transformed documents.
        '../build/ampshared.css': ['cssText', 'ampSharedCss'],
        '../build/ampdoc.css': ['cssText', 'ampDocCss'],
      },
    },
  ];
  const reactJsxPlugin = [
    '@babel/plugin-transform-react-jsx',
    {
      pragma: 'Preact.createElement',
      pragmaFrag: 'Preact.Fragment',
      useSpread: true,
    },
  ];
  const replacePlugin = getReplacePlugin();
  const preClosurePlugins = [
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    '@babel/plugin-transform-react-constant-elements',
    reactJsxPlugin,
    './build-system/babel-plugins/babel-plugin-transform-inline-configure-component',
    // TODO(alanorozco): Remove `replaceCallArguments` once serving infra is up.
    [
      './build-system/babel-plugins/babel-plugin-transform-log-methods',
      {replaceCallArguments: false},
    ],
    './build-system/babel-plugins/babel-plugin-transform-parenthesize-expression',
    './build-system/babel-plugins/babel-plugin-is_minified-constant-transformer',
    './build-system/babel-plugins/babel-plugin-transform-amp-extension-call',
    './build-system/babel-plugins/babel-plugin-transform-html-template',
    './build-system/babel-plugins/babel-plugin-transform-version-call',
    './build-system/babel-plugins/babel-plugin-transform-simple-array-destructure',
    replacePlugin,
    argv.single_pass
      ? './build-system/babel-plugins/babel-plugin-transform-amp-asserts'
      : null,
    argv.esm ? filterImportsPlugin : null,
    argv.esm
      ? './build-system/babel-plugins/babel-plugin-transform-function-declarations'
      : null,
    !isCheckTypes
      ? './build-system/babel-plugins/babel-plugin-transform-json-configuration'
      : null,
    argv.esm
      ? [
          './build-system/babel-plugins/babel-plugin-amp-mode-transformer',
          {isEsmBuild: !!argv.esm},
        ]
      : null,
    !(argv.fortesting || isCheckTypes)
      ? './build-system/babel-plugins/babel-plugin-is_dev-constant-transformer'
      : null,
  ].filter(Boolean);
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: false,
      targets: {esmodules: true},
    },
  ];
  const preClosurePresets = argv.esm ? [presetEnv] : [];
  const preClosureConfig = {
    compact: false,
    plugins: preClosurePlugins,
    presets: preClosurePresets,
    retainLines: true,
  };
  return preClosureConfig;
}

module.exports = {
  getPreClosureConfig,
};
