/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Global configuration file for the babelify transform.
 *
 * Notes: From https://babeljs.io/docs/en/plugins#plugin-ordering:
 * 1. Plugins run before Presets.
 * 2. Plugin ordering is first to last.
 * 3. Preset ordering is reversed (last to first).
 */

'use strict';

const minimist = require('minimist');
const {isTravisBuild} = require('./build-system/common/travis');
const argv = minimist(process.argv.slice(2));

const isClosureCompiler =
  argv._.includes('dist') || argv._.includes('check-types');
const {esm} = argv;

const targets = esm => {
  if (esm) {
    return {'esmodules': true};
  }

  if (isTravisBuild()) {
    return {'browsers': ['Last 2 versions', 'safari >= 9']};
  }

  return {'browsers': ['Last 2 versions']};
};

const plugins = esm => {
  const leadingComments =
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments';
  const reactConstantElements =
    '@babel/plugin-transform-react-constant-elements';
  const transformJSX = [
    '@babel/plugin-transform-react-jsx',
    {
      pragma: 'Preact.createElement',
      pragmaFrag: 'Preact.Fragment',
      useSpread: true,
    },
  ];
  const transformClasses = [
    '@babel/plugin-transform-classes',
    {
      loose: false,
    },
  ];

  if (esm) {
    return [leadingComments, reactConstantElements, transformJSX];
  }

  return [
    leadingComments,
    reactConstantElements,
    transformClasses,
    transformJSX,
  ];
};

const presets = esm => {
  if (esm) {
    return [
      [
        '@babel/preset-env',
        {
          'modules': false,
          'targets': targets(esm),
          'bugfixes': true,
        },
      ],
    ];
  }

  return [
    [
      '@babel/preset-env',
      {
        'modules': isClosureCompiler ? false : 'commonjs',
        'loose': true,
        'targets': targets(esm),
      },
    ],
  ];
};

// eslint-disable-next-line local/no-module-exports
module.exports = function(api) {
  api.cache(true);
  // Closure Compiler builds do not use any of the default settings below until its
  // an esm build. (Both Multipass and Singlepass)
  if (isClosureCompiler && !esm) {
    return {};
  }

  return {
    'plugins': plugins(esm),
    'presets': presets(esm),
    'compact': false,
    'sourceType': 'module',
  };
};
