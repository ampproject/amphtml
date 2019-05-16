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

const localPlugin = name =>
  require.resolve(`./babel-plugins/babel-plugin-${name}`);

const defaultPlugins = [
  // TODO(alanorozco): Remove `replaceCallArguments` once serving infra is up.
  [localPlugin('transform-log-methods'), {replaceCallArguments: false}],
  localPlugin('transform-parenthesize-expression'),
  localPlugin('is_minified-constant-transformer'),
  localPlugin('transform-amp-asserts'),
  localPlugin('transform-amp-extension-call'),
  localPlugin('transform-html-template'),
  localPlugin('transform-version-call'),
];

const esmRemovedImports = {
  './polyfills/document-contains': ['installDocContains'],
  './polyfills/domtokenlist-toggle': ['installDOMTokenListToggle'],
  './polyfills/fetch': ['installFetch'],
  './polyfills/math-sign': ['installMathSign'],
  './polyfills/object-assign': ['installObjectAssign'],
  './polyfills/object-values': ['installObjectValues'],
  './polyfills/promise': ['installPromise'],
};

/**
 * Resolves babel plugin set to apply before compiling on singlepass.
 * @param {!Object<string, boolean>} buildFlags
 * @return {!Array<string|!Array<string|!Object>>}
 */
function plugins({isCommonJsModule, isEsmBuild, isForTesting}) {
  const applied = [...defaultPlugins];
  if (isEsmBuild) {
    applied.push(['filter-imports', {imports: esmRemovedImports}]);
  }
  if (isCommonJsModule) {
    applied.push('transform-commonjs-es2015-modules');
  }
  if (!isForTesting) {
    applied.push(
      localPlugin('amp-mode-transformer'),
      localPlugin('is_dev-constant-transformer')
    );
  }
  return applied;
}

module.exports = {plugins};
