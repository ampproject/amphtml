'use strict';

module.exports = function (context) {
  return {
    BigIntLiteral(node) {
      context.report({
        node,
        message: 'BigInts are forbidden.',
      });
    },
  };
};
