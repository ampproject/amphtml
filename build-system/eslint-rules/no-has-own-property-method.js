'use strict';

module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type == 'MemberExpression' &&
          !node.callee.computed &&
          node.callee.property.name == 'hasOwnProperty'
        ) {
          context.report({
            node,
            message:
              'Do not use hasOwnProperty directly. ' +
              'Use hasOwn from src/core/types/object instead.',
          });
        }
      },
    };
  },
};
