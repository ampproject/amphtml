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

const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const {NODE_MODULES} = require('./sources');

module.exports = {
  external: NODE_MODULES,
  output: {
    format: 'esm',
    freeze: false,
  },
  treeshake: false,
  plugins: [
    resolve(),
    commonjs({extensions: ['.js', '.mjs']}),
    babel({
      babelrc: false,
      configFile: false,
      include: 'node_modules/**',
      plugins: [
        require.resolve(
          '../babel-plugins/babel-plugin-transform-stop-property-mangling'
        ),
      ],
    }),
  ],
};
