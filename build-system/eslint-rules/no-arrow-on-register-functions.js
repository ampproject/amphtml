'use strict';

const expression = [
  'CallExpression[callee.property.name=/registerService.*/]',
  'CallExpression[callee.name=/registerService.*/]',
].join(',');

module.exports = function (context) {
  return {
    [expression]: function (node) {
      node.arguments.forEach((arg) => {
        if (arg.type === 'ArrowFunctionExpression') {
          // TODO(erwinm): add fixer method.
          context.report({
            node,
            message:
              'registerService* methods should not use arrow functions as a constructor.',
          });
        }
      });
    },
  };
};
