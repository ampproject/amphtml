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

const fs = require('fs');
const path = require('path');

const JSCONFIG_PATH = path.join(__dirname, '../../jsconfig.json');
let aliasPaths = null;

/**
 * Reads import paths from jsconfig.json. This file is used by VSCode for
 * Intellisense/auto-import. Rather than duplicate and require updating both
 * files, we can read from it directly. JSConfig format looks like:
 * { compilerOptions: { paths: {
 *   '#foo/*': ['./src/foo/*'],
 *   '#bar/*': ['./bar/*'],
 * } } }
 * This method outputs the necessary alias object for the module-resolver Babel
 * plugin, which excludes the "/*" for each. The above paths would result in:
 * {
 *   '#foo/': './src/foo/',
 *   '#bar/': './bar/',
 * }
 * @return {!Object<string, string>}
 */
function readJsconfigPaths() {
  if (!aliasPaths) {
    const jsConfig = JSON.parse(fs.readFileSync(JSCONFIG_PATH, 'utf8'));
    aliasPaths = jsConfig.compilerOptions.paths;
  }

  // ESLint module-resolver autofix needs "/" to avoid false-positives:
  // src/services != #service/s
  // TODO(rcebulko): Fork and fix path matching in plugin
  // Impact: import * from '#preact' works fine, but `eslint --fix` will not
  // replace '../../src/preact' with '#preact'
  const stripSuffix = (s) => s.replace(/\/\*$/, '');
  const aliases = Object.entries(aliasPaths).map(([alias, [dest]]) => [
    stripSuffix(alias),
    stripSuffix(dest),
  ]);

  return Object.fromEntries(aliases);
}

/**
 * Import map configuration.
 * @return {!Object}
 */
function getImportResolver() {
  return {
    'root': ['.'],
    'alias': readJsconfigPaths(),
  };
}

/**
 * Import resolver Babel plugin configuration.
 * @return {!Array}
 */
function getImportResolverPlugin() {
  return ['module-resolver', getImportResolver()];
}

module.exports = {getImportResolver, getImportResolverPlugin};
