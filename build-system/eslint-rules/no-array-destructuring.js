/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

// Only allow array destructuring on preact functions that are known to return
// real arrays. This is to avoid the very large iterator polyfill and the very
// slow native and polyfilled runtime.
//
// Good:
// const [first] = useXYZ(0);
// const [x] = preact.useXYZ(0);
//
// Bad:
// const [b] = value;
// function bad([b]) {}
module.exports = function (context) {
  function isAllowed(node) {
    const {parent} = node;
    if (parent.type !== 'VariableDeclarator') {
      return false;
    }
    const {init} = parent;

    if (!init || init.type !== 'CallExpression') {
      return false;
    }

    const {callee} = init;

    if (callee.type === 'Identifier') {
      return callee.name.startsWith('use');
    }

    if (callee.type === 'MemberExpression') {
      const {object, property, computed} = callee;
      if (computed) {
        return false;
      }
      if (object.type !== 'Identifier' || object.name !== 'preact') {
        return false;
      }
      if (property.type !== 'Identifier' || !property.name.startsWith('use')) {
        return false;
      }
      return true;
    }

    return false;
  }

  return {
    ArrayPattern: function (node) {
      if (isAllowed(node)) {
        return;
      }

      context.report({
        node,
        message:
          'Array Destructuring is only allowed on known array-returning preact hooks',
      });
    },
  };
};
