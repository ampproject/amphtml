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
      const args = node.arguments;

      if (
        args.length === 1 &&
        (args[0].type === 'ObjectExpression' ||
          args[0].type === 'ArrayExpression')
      ) {
        return;
      }

      return context.report({
        node: args[0] || node,
        message:
          'Expected json configuration to pass in object or array literal',
      });
    },

    'CallExpression[callee.name=includeJsonLiteral]': function(node) {
      const args = node.arguments;

      if (args.length === 1 && args[0].type === 'Identifier') {
        return;
      }

      return context.report({
        node: args[0] || node,
        message: 'Expected identifier with json json literal value',
      });
    },

    'CallExpression[callee.name=jsonConfiguration] * Identifier': function(
      node
    ) {
      if (node.name === 'undefined') {
        return;
      }

      if (node.name === 'includeJsonLiteral') {
        return;
      }

      const {parent} = node;
      if (
        parent.type === 'CallExpression' &&
        parent.callee.name === 'includeJsonLiteral'
      ) {
        return;
      }

      if (
        parent.type === 'Property' &&
        parent.key === node &&
        !parent.computed
      ) {
        return;
      }

      context.report({
        node,
        message: 'Unexpected dynamic value inside json configuration object',
      });
    },
  };
};
