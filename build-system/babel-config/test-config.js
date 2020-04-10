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
const {getDevDependencies} = require('./dev-dependencies');
const {getReplacePlugin} = require('./replace-plugin');

/**
 * Ignore devDependencies except for 'chai-as-promised' which contains ES6 code.
 * ES6 code is fine for most test environments, but not for integration tests
 * running on SauceLabs since some older browsers need ES5.
 */
const ignoredModules = getDevDependencies().filter((dep) =>
  dep.includes('chai-as-promised')
);

/**
 * Gets the config for babel transforms run during `gulp [unit|integration]`.
 *
 * @return {!Object}
 */
function getTestConfig() {
  const instanbulPlugin = [
    'istanbul',
    {
      exclude: [
        'ads/**/*.js',
        'build-system/**/*.js',
        'extensions/**/test/**/*.js',
        'third_party/**/*.js',
        'test/**/*.js',
        'testing/**/*.js',
      ],
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
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: 'commonjs',
      loose: true,
      targets: {'browsers': ['Last 2 versions']},
    },
  ];
  const replacePlugin = getReplacePlugin();
  const testPlugins = [
    argv.coverage ? instanbulPlugin : null,
    replacePlugin,
    './build-system/babel-plugins/babel-plugin-transform-json-configuration',
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    '@babel/plugin-transform-react-constant-elements',
    '@babel/plugin-transform-classes',
    reactJsxPlugin,
  ].filter(Boolean);
  const testPresets = [presetEnv];
  return {
    compact: false,
    ignore: ignoredModules,
    plugins: testPlugins,
    presets: testPresets,
  };
}

module.exports = {
  getTestConfig,
};
