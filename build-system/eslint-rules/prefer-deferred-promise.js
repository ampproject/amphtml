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
'use strict';

module.exports = function(context) {
  function isAssignment(node, name) {
    if (node.type !== 'AssignmentExpression') {
      return false;
    }

    const {right} = node;
    return right.type === 'Identifier' && right.name === name;
  }

  return {
    // Promise.resolve(CALL())
    CallExpression(node) {
      if (/\btest|build-system/.test(context.getFilename())) {
        return;
      }

      const {callee} = node;
      if (callee.type !== 'MemberExpression') {
        return;
      }

      const {object, property} = callee;
      if (
        object.type !== 'Identifier' ||
        object.name !== 'Promise' ||
        property.type !== 'Identifier' ||
        property.name !== 'resolve'
      ) {
        return;
      }

      const arg = node.arguments[0];
      if (!arg || arg.type !== 'CallExpression') {
        return;
      }

      context.report({
        node,
        message:
          'Use the Promise constructor, or tryResolve in the ' +
          'src/utils/promise.js module.',
      });
    },

    // new Promise(...)
    NewExpression(node) {
      if (/\btest|build-system/.test(context.getFilename())) {
        return;
      }

      const {callee} = node;
      if (callee.type !== 'Identifier' || callee.name !== 'Promise') {
        return;
      }

      const comments = context.getCommentsBefore(callee);
      const ok = comments.some(comment => comment.value === 'OK');
      if (ok) {
        return;
      }

      const resolver = node.arguments[0];
      if (!/Function/.test(resolver.type)) {
        context.report({node: resolver, message: 'Must pass function'});
        return;
      }

      const resolve = resolver.params[0];
      if (!resolve || resolve.type !== 'Identifier') {
        context.report({node: resolver, message: 'Must have resolve param'});
        return;
      }

      const {name} = resolve;
      let assigned = false;

      if (
        resolver.type === 'ArrowFunctionExpression' &&
        resolver.expression === true
      ) {
        const {body} = resolver;
        assigned = isAssignment(body, name);
      } else {
        const {body} = resolver.body;

        for (let i = 0; i < body.length; i++) {
          const node = body[i];
          if (node.type !== 'ExpressionStatement') {
            continue;
          }

          const {expression} = node;
          assigned = isAssignment(expression, name);
          if (assigned) {
            break;
          }
        }
      }

      if (!assigned) {
        return;
      }

      const message = [
        'Instead of creating a pending Promise, please use ',
        'Deferred in the src/utils/promise.js module.',
      ].join('\n\t');
      context.report({node: resolver, message});
    },
  };
};
