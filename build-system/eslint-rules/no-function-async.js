'use strict';

module.exports = function (context) {
  return {
    Function(node) {
      if (!node.async) {
        return;
      }
      context.report({
        node,
        message: 'Async functions are foribdden.',
      });
    },
  };
};
