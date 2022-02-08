'use strict';

// Disables use of the `this` value when we suspect that it is using the
// implicit global `this`. `this` is only valid inside class
// methods/constructors, property definitions, and nested arrow functions.
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
            case 'PropertyDefinition':
              return;

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
