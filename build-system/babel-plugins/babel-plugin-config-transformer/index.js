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

let hasThirdPartyRegex = false;
let hasCdnProxyRegex = false;

module.exports = function({types: t}) {
  return {
    visitor: {
      VariableDeclarator(path) {
        const {node} = path;
        const {name} = node.id;
        if (name === 'thirdPartyFrameRegex') {
          hasThirdPartyRegex = true;
          path.parentPath.remove();
        } else if (name === 'cdnProxyRegex') {
          hasCdnProxyRegex = true;
          path.parentPath.remove();
        }
      },
      LogicalExpression(path) {
        if (!hasThirdPartyRegex || !hasCdnProxyRegex) {
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
  };
};
