'use strict';

// This rule asserts that we only grab properties from getMode(), and never
// store a reference to the return value.
//
// Good:
// getMode().foo;
// const x = getMode().test;
//
// Bad:
// const mode = getMode();
// isTest(getMode());
// obj[getMode()];
module.exports = function (context) {
  return {
    'CallExpression[callee.name=getMode]': function (node) {
      if (
        node.parent.type === 'MemberExpression' &&
        node.parent.object === node
      ) {
        return;
      }

      context.report({
        node,
        message:
          'Do not re-alias getMode or its return value so it can be ' +
          "DCE'd. Use explicitly like `getMode().localDev` instead.",
      });
    },
  };
};
