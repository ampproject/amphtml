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

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import pkg from './package.json';

const plugins = [
  resolve(),
  babel({
    exclude: 'node_modules/**',
    plugins: [["transform-react-jsx", { "pragma": "h" }]],
  }),
  commonjs(),
];

// Start our server if we are watching
if (process.env.ROLLUP_WATCH) {
  const servePlugin = serve({
    contentBase: ['dist'],
    host: 'localhost',
    port: 8000,
  });

  plugins.push(servePlugin);
}

export default [
  {
    input: 'app.js',
    output: {
      name: 'AMPDevDashboard',
      file: 'dist/app.js',
      format: 'iife',
      sourcemap: true
    },
    context: 'window',
    plugins: plugins
  }
];
