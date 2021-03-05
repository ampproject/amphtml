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

/**
 * Gets the config for babel transforms run during `gulp lint`.
 *
 * @return {!Object}
 */
function getEslintConfig() {
  const presetEnv = [
    '@babel/preset-env',
    {
      shippedProposals: true,
      modules: false,
      targets: {esmodules: true},
    },
  ];

  return {
    compact: false,
    presets: [presetEnv],
    plugins: [enableSyntax],
  };
}

/**
 * @return {{
 *  manipulateOptions: {Function(_opts: *, parserOpts: *): void}
 * }}
 */
function enableSyntax() {
  return {
    manipulateOptions(_opts, parserOpts) {
      parserOpts.plugins.push('jsx', 'importAssertions');
    },
  };
}

module.exports = {
  getEslintConfig,
};
