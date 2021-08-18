'use strict';

module.exports = function (context) {
  return {
    Function(node) {
      if (!node.generator) {
        return;
      }
      context.report({
        node,
        message: 'Generator functions are foribdden.',
      });
    },
  };
};
