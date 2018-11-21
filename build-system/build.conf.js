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

const defaultPlugins = [
  require.resolve(
      './babel-plugins/babel-plugin-transform-parenthesize-expression'),
];

module.exports = {
  plugins: (isEsmBuild, isCommonJsModule) => {
    let pluginsToApply = defaultPlugins;
    if (isEsmBuild) {
      pluginsToApply = pluginsToApply.concat([
        [require.resolve('babel-plugin-filter-imports'), {
          'imports': {
            './polyfills/fetch': ['installFetch'],
            './polyfills/domtokenlist-toggle': ['installDOMTokenListToggle'],
            './polyfills/document-contains': ['installDocContains'],
            './polyfills/math-sign': ['installMathSign'],
            './polyfills/object-assign': ['installObjectAssign'],
            './polyfills/promise': ['installPromise'],
          },
        }],
      ]);
    }
    if (isCommonJsModule) {
      pluginsToApply = pluginsToApply.concat([
        [require.resolve('babel-plugin-transform-commonjs-es2015-modules')],
      ]);
    }
    return pluginsToApply;
  },
};
