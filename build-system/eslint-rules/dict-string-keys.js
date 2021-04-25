/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

module.exports = function (context) {
  return {
    CallExpression: function (node) {
      if (node.callee.name === 'dict') {
        if (node.arguments[0]) {
          const arg1 = node.arguments[0];
          if (arg1.type !== 'ObjectExpression') {
            context.report({
              node,
              message:
                'calls to `dict` must have an Object Literal ' +
                'Expression as the first argument',
            });
            return;
          }
          checkNode(arg1, context);
        }
      }
    },
  };
};

/**
 * @param {*} node
 * @param {*} context
 */
function checkNode(node, context) {
  if (node.type === 'ObjectExpression') {
    node.properties.forEach(function (prop) {
      if (!prop.key || (!prop.key.raw && !prop.computed)) {
        const {name = `[${prop.type}]`} = prop.key || prop.argument || {};
        context.report({
          node: prop,
          message:
            `Found: ${name}.` +
            'The Object Literal Expression passed into `dict` must only contain string keyed properties.',
        });
      }
      if (prop.value) {
        checkNode(prop.value, context);
      }
    });
  } else if (node.type === 'ArrayExpression') {
    node.elements.forEach(function (elem) {
      checkNode(elem, context);
    });
  }
}
