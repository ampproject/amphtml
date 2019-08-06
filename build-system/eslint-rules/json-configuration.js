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
 * Finds the jsonConfiguration helper function from src/json.js, and performs
 * validation on its input.
 */

module.exports = function(context) {
  return {
    'CallExpression[callee.name=jsonConfiguration]': function(node) {
      const {callee} = node;
      if (callee.type !== 'Identifier') {
        return;
      }

      if (callee.name !== 'jsonConfiguration') {
        return;
      }

      const args = node.arguments;

      if (args.length !== 1 || args[0].type !== 'ObjectExpression') {
        return context.report({
          node: args[0] || node,
          message: 'Expected json configuration to pass in object literal',
        });
      }
    },

    'CallExpression[callee.name=jsonConfiguration] > ObjectExpression *': function(
      node
    ) {
      if (node.type === 'Literal') {
        return;
      }
      if (node.type === 'ArrayExpression') {
        return;
      }
      if (node.type === 'ObjectExpression') {
        return;
      }
      if (node.type === 'Identifier' && node.name === 'undefined') {
        return;
      }

      // Handle the string version of a property key
      if (node.type === 'Property') {
        return;
      }

      // Handle the identifier key of an object expression.
      const {parent} = node;
      if (
        parent.type === 'Property' &&
        parent.key === node &&
        !parent.computed
      ) {
        return;
      }

      // Template literals are nice to avoid escaping issues.
      if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
        return;
      }
      if (node.type === 'TemplateElement') {
        return;
      }

      context.report({
        node,
        message: 'Unexpected dynamic value inside json configuration object',
      });
    },
  };
};
