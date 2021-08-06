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

// Disables use of the `this` value when we suspect that it is using the
// implicit global `this`. `this` is only valid inside class
// methods/constructors, and nested arrow functions.
//
// We special case calls to `fn.bind`, `fn.call`, and `fn.apply`, since they
// are usually forwarding the `this` context and not direclty using it. The
// called function should be corrected, not the caller.
//
// Good:
// class Foo {
//   test() {
//     this;
//   }
// }
// function Bar() {
//   this;
// }
// obj.baz = function() {
//   this;
// };
//
// Bad:
// var foo = function() {
//   this;
// };
// function bar() {
//   this;
// }
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    return {
      ThisExpression(node) {
        const ancestors = context.getAncestors().slice().reverse();

        const maybeCall = ancestors[0];
        if (
          maybeCall.type === 'CallExpression' &&
          maybeCall.arguments[0] === node
        ) {
          const {callee} = maybeCall;
          if (callee.type === 'MemberExpression' && !callee.computed) {
            const {property} = callee;
            if (
              property.type === 'Identifier' &&
              (property.name === 'bind' ||
                property.name === 'call' ||
                property.name === 'apply')
            ) {
              return;
            }
          }
        }

        for (let i = 0; i < ancestors.length; i++) {
          const ancestor = ancestors[i];
          switch (ancestor.type) {
            case 'FunctionExpression':
              const parent = ancestors[i + 1];
              // Allow functions that are used as methods.
              if (
                parent.type === 'Property' ||
                parent.type === 'MethodDefinition' ||
                (parent.type === 'AssignmentExpression' &&
                  parent.left.type === 'MemberExpression')
              ) {
                return;
              }
            // fallthrough

            case 'FunctionDeclaration':
              const {id} = ancestor;
              // Allow legacy function constructors
              if (id && /^[A-Z]/.test(id.name)) {
                return;
              }

            case 'Program':
              return context.report({
                node,
                message:
                  '`this` looks to be using the implicit global `this` value on accident.',
              });
          }
        }
      },
    };
  },
};
