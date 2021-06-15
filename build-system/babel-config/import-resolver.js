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

const JSCONFIG_PATH = path.join(__dirname, '..', '..', 'tsconfig.json');
let jsConfigPaths = null;

/**
 * Reads import paths from tsconfig.json. This file is used by VSCode for
 * Intellisense/auto-import. Rather than duplicate and require updating both
 * files, we can read from it directly. JSConfig format looks like:
 * { compilerOptions: { paths: {
 *   '#foo/*': ['./src/foo/*'],
 *   '#bar/*': ['./bar/*'],
 * } } }
 * This method outputs the necessary alias object for the module-resolver Babel
 * plugin, which excludes the "/*" for each. The above paths would result in:
 * {
 *   '#foo': './src/foo',
 *   '#bar': './bar',
 * }
 * @return {!Object<string, string>}
 */
function readJsconfigPaths() {
  if (!jsConfigPaths) {
    const jsConfig = JSON.parse(fs.readFileSync(JSCONFIG_PATH, 'utf8'));
    const aliasPaths = jsConfig.compilerOptions.paths;

    const stripSuffix = (s) => s.replace(/\/\*$/, '');
    const aliases = Object.entries(aliasPaths).map(([alias, [dest]]) => [
      stripSuffix(alias),
      stripSuffix(dest),
    ]);

    jsConfigPaths = Object.fromEntries(aliases);
  }

  return jsConfigPaths;
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
 * Produces an alias map with paths relative to the provided root.
 * @param {string} rootDir
 * @return {!Object<string, string>}
 */
function getRelativeAliasMap(rootDir) {
  return Object.fromEntries(
    Object.entries(getImportResolver().alias).map(([alias, destPath]) => [
      alias,
      path.join(rootDir, destPath),
    ])
  );
}

/**
 * Import resolver Babel plugin configuration.
 * @return {!Array}
 */
function getImportResolverPlugin() {
  return ['module-resolver', getImportResolver()];
}

module.exports = {
  getImportResolver,
  getImportResolverPlugin,
  getRelativeAliasMap,
};
