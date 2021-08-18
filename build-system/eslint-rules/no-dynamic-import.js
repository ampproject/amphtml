'use strict';

module.exports = function (context) {
  return {
    ImportExpression(node) {
      context.report({
        node,
        message: 'Dynamic import is forbidden.',
      });
    },
  };
};
