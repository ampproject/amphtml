'use strict';

// Forbids use of Spread elements when they require an iterator polyfill
//
// Good:
// ```
// const obj = {foo: 1, ...obj};
// ```
//
// Bad:
// ```
// const args = [1, 2, 3, ...array];
// bar(...args);
// ```
module.exports = function (context) {
  return {
    'ArrayExpression > SpreadElement': function (node) {
      context.report({node, message: 'Iterator spreading is not allowed.'});
    },

    'CallExpression > SpreadElement': function (node) {
      context.report({node, message: 'Iterator spreading is not allowed.'});
    },
  };
};
