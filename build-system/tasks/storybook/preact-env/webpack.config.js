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
const path = require('path');
const {DefinePlugin} = require('webpack');

module.exports = ({config}) => {
  config.resolveLoader = {
    modules: [
      path.join(__dirname, '../node_modules'),
      path.join(__dirname, '../../../../node_modules'),
    ],
  };
  config.resolve = {
    modules: [
      path.join(__dirname, '../node_modules'),
      path.join(__dirname, '../../../../node_modules'),
    ],
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
    },
  };
  config.module = {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: [
            [
              '@babel/preset-env',
              {
                bugfixes: true,
                targets: {'browsers': ['Last 2 versions']},
              },
            ],
            [
              '@babel/preset-react',
              {
                pragma: 'Preact.createElement',
                pragmaFrag: 'Preact.Fragment',
                useSpread: true,
              },
            ],
          ],
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  };
  // Replaced by minify-replace (babel) in the usual build pipeline
  // build-system/babel-config/helpers.js#getReplacePlugin
  config.plugins.push(new DefinePlugin({IS_ESM: false}));
  return config;
};
