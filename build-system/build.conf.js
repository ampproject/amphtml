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

const localPlugin = name => require.resolve(`./babel-plugins/${name}`);

/** Applied to singlepass and multipass. */
const defaultPlugins = [
  [
    localPlugin('babel-plugin-transform-log-methods'),
    {
      // TODO(alanorozco): Remove option once serving infra is up.
      replaceCallArguments: false,
    },
  ],
  localPlugin('babel-plugin-transform-parenthesize-expression'),
];

const singlepassPlugins = [
  ...defaultPlugins,
  localPlugin('babel-plugin-transform-amp-asserts'),
  localPlugin('babel-plugin-transform-amp-extension-call'),
  localPlugin('babel-plugin-transform-html-template'),
  localPlugin('babel-plugin-transform-parenthesize-expression'),
  localPlugin('babel-plugin-transform-version-call'),
  localPlugin('babel-plugin-is_minified-constant-transformer'),
];

const multipassPlugins = [...defaultPlugins];

/** Polyfills to be removed from ESM build. */
const esmFilteredPolyfills = {
  './polyfills/document-contains': ['installDocContains'],
  './polyfills/domtokenlist-toggle': ['installDOMTokenListToggle'],
  './polyfills/fetch': ['installFetch'],
  './polyfills/math-sign': ['installMathSign'],
  './polyfills/object-assign': ['installObjectAssign'],
  './polyfills/object-values': ['installObjectValues'],
  './polyfills/promise': ['installPromise'],
};

/**
 * @typedef {{
 *   isSinglepass: (boolean|undefined),
 *   isEsmBuild: (boolean|undefined),
 *   isCommonJsModule: (boolean|undefined),
 *   isForTesting: (boolean|undefined),
 * }}
 */
let BuildConfigDef;

/**
 * Resolves babel plugins to be applied before compiling through Closure.
 * @param {BuildConfigDef} buildConfig
 * @return {!Array<(string|!Array<string|!Object>)>}
 */
function plugins({
  isSinglepass,
  isEsmBuild,
  isCommonJsModule,
  isForTesting,
} = {}) {
  if (!isSinglepass) {
    return multipassPlugins;
  }
  const pluginsToApply = [...singlepassPlugins];
  if (isEsmBuild) {
    pluginsToApply.push([
      'babel-plugin-filter-imports',
      {imports: esmFilteredPolyfills},
    ]);
  }
  if (isCommonJsModule) {
    pluginsToApply.push('babel-plugin-transform-commonjs-es2015-modules');
  }
  if (!isForTesting) {
    pluginsToApply.push(
        localPlugin('babel-plugin-amp-mode-transformer'),
        localPlugin('babel-plugin-is_dev-constant-transformer')
    );
  }
  return pluginsToApply;
}

module.exports = {plugins};
