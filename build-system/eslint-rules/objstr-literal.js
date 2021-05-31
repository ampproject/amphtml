/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

module.exports = function objstrLiteral(context) {
  return {
    CallExpression(node) {
      if (node.callee.type !== 'Identifier' || node.callee.name !== 'objstr') {
        return;
      }
      if (
        node.arguments.length !== 1 ||
        node.arguments[0].type !== 'ObjectExpression'
      ) {
        context.report({
          node,
          message: `${node.callee.name}() must have a single argument that is an Object Expression Literal`,
        });
        return;
      }
      for (const {key, type, argument} of node.arguments[0].properties) {
        if (!key) {
          context.report({
            node,
            message: `${
              node.callee.name
            }() must only contain keyed props, found [${type}] ${
              (argument && argument.name) || '(unknown)'
            }`,
          });
        }
      }
    },
  };
};
