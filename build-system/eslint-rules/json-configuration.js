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

module.exports = function (context) {
  const configurationCalls = ['jsonConfiguration', 'jsonLiteral'].map(
    (name) => `CallExpression[callee.name=${name}]`
  );

  function verifyPath(node) {
    for (let n = node; n; n = n.parent) {
      const {parent} = n;
      const {type} = parent;

      if (type === 'ArrayExpression' || type === 'ObjectExpression') {
        continue;
      }

      if (type === 'Property' && parent.value === n) {
        continue;
      }

      if (type === 'CallExpression') {
        const {name} = parent.callee;
        if (name === 'jsonConfiguration' || name === 'jsonLiteral') {
          break;
        }
      }

      return context.report({
        node,
        message: 'Value must descend from object/array literals only.',
      });
    }
  }

  return {
    'CallExpression[callee.name=jsonConfiguration]': function (node) {
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

    [`:matches(${configurationCalls}) * Identifier`]: function (node) {
      const {name, parent} = node;
      if (name === 'undefined') {
        return;
      }

      if (name === 'includeJsonLiteral') {
        return;
      }

      if (name in global) {
        return;
      }

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

      if (
        parent.type === 'MemberExpression' &&
        parent.property === node &&
        !parent.computed
      ) {
        return;
      }

      context.report({
        node,
        message:
          'Unexpected dynamic reference inside json configuration object. Did you mean to use includeJsonLiteral?',
      });
    },

    'CallExpression[callee.name=jsonLiteral]': function (node) {
      const args = node.arguments;

      if (args.length === 1 && args[0].type !== 'Identifier') {
        return;
      }

      return context.report({
        node: args[0] || node,
        message:
          'Expected json literal to pass in literal boolean, string, number, object, or array. Did you pass a reference to one?',
      });
    },

    'CallExpression[callee.name=includeJsonLiteral]': function (node) {
      const args = node.arguments;

      if (args.length !== 1 || args[0].type !== 'Identifier') {
        return context.report({
          node: args[0] || node,
          message: 'Expected reference identifier to a json literal value',
        });
      }

      return verifyPath(node);
    },
  };
};
