'use strict';

// Forbids use of Rest elements when they require an iterator polyfill, or
// there's no clear benefit.
//
// Good:
// ```
// function foo(...args) {}
// const {...rest} = {foo: 1};
// ```
//
// Bad:
// ```
// const [...rest] = [1, 2, 3];
// ```
module.exports = function (context) {
  return {
    'ArrayPattern > RestElement': function (node) {
      context.report({
        node,
        message: 'Collecting elements using a rest element is not allowed.',
      });
    },
  };
};
