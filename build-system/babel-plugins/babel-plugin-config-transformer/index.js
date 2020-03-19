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

const {basename, dirname, relative} = require('path');
let allowExecution = false;

// Only executes on the ESM build, intended to use with the Google AMP Cache.
module.exports = function({types: t}) {
  return {
    pre() {
      const {root, filename} = this.file.opts;
      const base = relative(root, filename);
      if (dirname(base) === 'src' && basename(base) === 'config.js') {
        // Only use for './src/config.js'.
        allowExecution = true;
      }

      if (dirname(filename).includes('babel-plugin')) {
        // Ensure babel-plugin tests work.
        allowExecution = true;
      }
    },
    visitor: {
      VariableDeclarator(path) {
        if (!allowExecution) {
          return;
        }

        const {node} = path;
        const {name} = node.id;
        if (name === 'thirdPartyFrameRegex') {
          path.parentPath.remove();
        } else if (name === 'cdnProxyRegex') {
          path.parentPath.remove();
        }
      },
      LogicalExpression(path) {
        if (!allowExecution) {
          return;
        }

        const {node} = path;
        const {left, right} = node;
        if (
          (t.isIdentifier(left) && left.name === 'thirdPartyFrameRegex') ||
          left.name === 'cdnProxyRegex'
        ) {
          path.replaceWith(right);
        } else if (t.isMemberExpression(left)) {
          const {object, computed, property} = left;
          if (
            object.name === 'env' &&
            computed &&
            t.isStringLiteral(property)
          ) {
            path.replaceWith(right);
          }
        }
      },
    },
    post() {
      allowExecution = false;
    },
  };
};
