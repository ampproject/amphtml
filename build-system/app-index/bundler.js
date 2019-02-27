/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const babel = require('rollup-plugin-babel');
const colors = require('ansi-colors');
const commonjs = require('rollup-plugin-commonjs');
const log = require('fancy-log');
const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const rollup = require('rollup');

const rootDir = path.dirname(path.dirname(__dirname));

const plugins = [
  resolve(),
  babel({
    exclude: '**/node_modules/**',
    plugins: [
      ['@babel/plugin-transform-react-jsx', {'pragma': 'h'}],
      ['@babel/plugin-proposal-class-properties'],
    ],
    presets: [['@babel/preset-env', {modules: false}]],
  }),
  commonjs(),
];

const inputOptions = {
  plugins,
};

const outputOptions = {
  format: 'iife',
};

module.exports = {
  bundleComponent: async componentEntryFile => {
    inputOptions.input = componentEntryFile;
    const bundle = await rollup.rollup(inputOptions);
    const {code} = await bundle.generate(outputOptions);
    log('Generated bundle for',
        colors.cyan(path.relative(rootDir, componentEntryFile)));
    return code;
  },
};

