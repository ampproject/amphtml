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
  require.resolve('./babel-plugins/babel-plugin-transform-html-template'),
  require.resolve(
    './babel-plugins/babel-plugin-transform-parenthesize-expression'
  ),
  require.resolve(
    './babel-plugins/babel-plugin-is_minified-constant-transformer'
  ),
  require.resolve('./babel-plugins/babel-plugin-transform-amp-extension-call'),
  require.resolve('./babel-plugins/babel-plugin-transform-version-call'),
];

module.exports = {
  plugins({isEsmBuild, isForTesting, isSinglePass}) {
    let pluginsToApply = defaultPlugins;
    // TODO(erwinm): This is temporary until we remove the assert/log removals
    // from the java transformation to the babel transformation.
    // There is currently a weird interaction where when we do the transform
    // in babel and leave a bare "string", Closure Compiler does not remove
    // the dead string expression statements. We cannot just outright remove
    // the argument of the assert/log calls since we would need to inspect
    // if the arguments have any method calls (which might have side effects).
    if (isSinglePass) {
      pluginsToApply.push(
        require.resolve('./babel-plugins/babel-plugin-transform-amp-asserts')
      );
    }
    if (isEsmBuild) {
      pluginsToApply = pluginsToApply.concat([
        [
          require.resolve('babel-plugin-filter-imports'),
          {
            'imports': {
              './polyfills/fetch': ['installFetch'],
              './polyfills/domtokenlist-toggle': ['installDOMTokenListToggle'],
              './polyfills/document-contains': ['installDocContains'],
              './polyfills/math-sign': ['installMathSign'],
              './polyfills/object-assign': ['installObjectAssign'],
              './polyfills/object-values': ['installObjectValues'],
              './polyfills/promise': ['installPromise'],
            },
          },
        ],
      ]);
    }
    if (!isForTesting) {
      pluginsToApply = pluginsToApply.concat([
        require.resolve(
          './babel-plugins/babel-plugin-is_dev-constant-transformer'
        ),
        require.resolve('./babel-plugins/babel-plugin-amp-mode-transformer'),
      ]);
    }
    return pluginsToApply;
  },

  eliminateIntermediateBundles() {
    return [
      require.resolve('./babel-plugins/babel-plugin-transform-prune-namespace'),
    ];
  },
};
