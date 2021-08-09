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
// @ts-nocheck

/**
 * Changes the values of getMode().test, getMode().localDev to false
 * and getMode().localDev to true.
 * @param {Object} babelTypes
 */
const {dirname, join, relative, resolve} = require('path').posix;

// This plugin is only executed when bundling for production builds (minified).
module.exports = function ({types: t}) {
  let getModeFound = false;
  return {
    visitor: {
      ImportDeclaration({node}, state) {
        const {source, specifiers} = node;
        if (!source.value.endsWith('/mode')) {
          return;
        }
        specifiers.forEach((specifier) => {
          if (specifier.imported && specifier.imported.name === 'getMode') {
            const filepath = relative(
              join(__dirname, '../../../'),
              resolve(dirname(state.file.opts.filename), source.value)
            );
            if (filepath.endsWith('src/mode')) {
              getModeFound = true;
            }
          }
        });
      },
      MemberExpression(path) {
        if (!getModeFound) {
          return;
        }

        const {node} = path;
        const {object: obj, property} = node;
        const {callee} = obj;
        const {INTERNAL_RUNTIME_VERSION: version} = this.opts;

        if (callee && callee.name === 'getMode') {
          if (property.name === 'test' || property.name === 'localDev') {
            path.replaceWith(t.booleanLiteral(false));
          } else if (property.name === 'development') {
            path.replaceWith(t.booleanLiteral(false));
          } else if (property.name === 'minified') {
            path.replaceWith(t.booleanLiteral(true));
          } else if (property.name === 'version') {
            path.replaceWith(t.stringLiteral(version));
          }
        }
      },
      CallExpression(path) {
        const {INTERNAL_RUNTIME_VERSION: version} = this.opts;
        if (path.get('callee').referencesImport('#core/mode', 'version')) {
          path.replaceWith(t.stringLiteral(version));
        }
      },
    },
  };
};
