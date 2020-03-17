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

/**
 * Changes the values of getMode().test, getMode().localDev to false
 * and getMode().localDev to true.
 * @param {Object} babelTypes
 */
const {resolve, dirname} = require('path');

function replacementValue(node) {
  const {object: obj, property} = node;
  const {callee} = obj;
  if (callee && callee.name === 'getMode') {
    if (
      property.name === 'test' ||
      property.name === 'localDev' ||
      property.name === 'development'
    ) {
      return false;
    }
    if (property.name === 'minified') {
      return true;
    }
  }

  return null;
}

module.exports = function({types: t}) {
  let getModeFound = false;
  return {
    visitor: {
      ImportDeclaration({node}, state) {
        const {specifiers, source} = node;
        if (!source.value.endsWith('/mode')) {
          return;
        }
        specifiers.forEach(specifier => {
          if (specifier.imported && specifier.imported.name === 'getMode') {
            const filepath = resolve(
              dirname(state.file.opts.filename),
              source.value
            );
            if (filepath.endsWith('/amphtml/src/mode')) {
              getModeFound = true;
            }
          }
        });
      },
      AssignmentExpression(path) {
        if (!getModeFound) {
          return;
        }

        const {node} = path;
        if (t.isMemberExpression(node.left)) {
          const value = replacementValue(node.left);
          if (value !== null) {
            path.replaceWith(t.booleanLiteral(value));
            path.skip();
          }
        }
      },
      MemberExpression(path) {
        if (!getModeFound) {
          return;
        }

        const value = replacementValue(path.node, t);
        if (value !== null) {
          path.replaceWith(t.booleanLiteral(value));
        }
      },
    },
  };
};
