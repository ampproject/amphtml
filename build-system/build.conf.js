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
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const localPlugin = name => require.resolve(`./babel-plugins/${name}`);

const defaultPlugins = [
  localPlugin('babel-plugin-transform-amp-asserts'),
  localPlugin('babel-plugin-transform-html-template'),
  [
    localPlugin('babel-plugin-transform-log-methods'), {
      // TODO(alanorozco): Enable and remove option once serving infra is up.
      replaceCallArguments: false,
    },
  ],
  localPlugin('babel-plugin-transform-parenthesize-expression'),
  localPlugin('babel-plugin-is_minified-constant-transformer'),
];

function plugins({
  isEsmBuild,
  isCommonJsModule,
  isForTesting,
}) {
  const pluginsToApply = [...defaultPlugins];
  if (isEsmBuild) {
    pluginsToApply.push([
      'babel-plugin-filter-imports',
      {
        imports: {
          './polyfills/document-contains': ['installDocContains'],
          './polyfills/domtokenlist-toggle': ['installDOMTokenListToggle'],
          './polyfills/fetch': ['installFetch'],
          './polyfills/math-sign': ['installMathSign'],
          './polyfills/object-assign': ['installObjectAssign'],
          './polyfills/object-values': ['installObjectValues'],
          './polyfills/promise': ['installPromise'],
        },
      },
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
