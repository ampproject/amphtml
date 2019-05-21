/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * Forces `expect` calls to be preceded by `await` in end-to-end tests.
 *
 * Bad:
 *   expect(actual).to.equal(expected);
 * Good:
 *   await expect(actual).to.equal(expected);
 */
module.exports = function(context) {
  return {
    CallExpression(node) {
      const filename = context.getFilename();
      if (!/test-e2e|\/test\/e2e\//.test(filename)) {
        return;
      }

      const {callee} = node;
      if (callee.type !== 'Identifier') {
        return;
      }

      if (callee.name !== 'expect') {
        return;
      }

      if (hasAwaitParent(node)) {
        return;
      }

      context.report({
        node,
        message: '`expect` in end-to-end tests must use `await`.',
      });
    },
  };
};

/**
 * Returns true if the given espree AST node is a child of an `AwaitExpression`.
 * @param {!Object} node
 * @return {boolean}
 */
function hasAwaitParent(node) {
  while (node) {
    if (node.type == 'AwaitExpression') {
      return true;
    }
    node = node.parent;
  }
  return false;
}
