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

const path = require('path');

module.exports = function(context) {
  const setStyleCall = 'CallExpression[callee.name=setStyle]';
  const setStylesCall = 'CallExpression[callee.name=setStyles], CallExpression[callee.name=setImportantStyles]';
  const resetStylesCall = 'CallExpression[callee.name=resetStyles]';

  function isOk(node) {
    const comments = node.leadingComments || [];
    return comments.some(comment => comment.value === 'OK');
  }

  return {
    [setStyleCall]: function(node) {
      const filePath = context.getFilename();
      if (filePath.endsWith('src/style.js')) {
        return;
      }

      const arg = node.arguments[1];
      if (!arg || isOk(arg)) {
        return;
      }

      if (arg.type !== 'Literal' || typeof arg.value !== 'string') {
        return context.report({
          node: arg || node,
          message: 'property argument (the second argument) to setStyle must be a string literal',
        });
      }
    },

    [setStylesCall]: function(node) {
      const callName = node.callee.name;
      const arg = node.arguments[1];

      if (!arg || isOk(arg)) {
        return;
      }

      if (arg.type !== 'ObjectExpression') {
        return context.report({
          node: arg || node,
          message: `styles argument (the second argument) to ${callName} must be an object`,
        });
      }

      const {properties} = arg;
      for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];

        if (prop.computed) {
          context.report({
            node: prop,
            message: 'Style names must not be computed',
          });
          continue;
        }
      }
    },

    [resetStylesCall]: function(node) {
      const arg = node.arguments[1];

      if (!arg || isOk(arg)) {
        return;
      }

      if (arg.type !== 'ArrayExpression') {
        return context.report({
          node: arg || node,
          message: `styles argument (the second argument) to resetStyles must be an array`,
        });
      }

      const {elements} = arg;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];

        if (el.type !== 'Literal' || typeof el.value !== 'string') {
          context.report({
            node: el,
            message: 'Style names must be string literals',
          });
          continue;
        }
      }
    },
  };
};
