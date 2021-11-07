'use strict';

/**
 * Ensures private properties are not used in the file. If they are, they must
 * be quoted.
 *
 * @return {!Object}
 */
module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    return {
      MemberExpression(node) {
        if (node.computed || !node.property.name.endsWith('_')) {
          return;
        }

        context.report({
          node,
          message:
            'Unquoted private properties are not allowed in BaseElement. Please use quotes',
          fix(fixer) {
            const {object} = node;
            return fixer.replaceTextRange(
              [object.end, node.end],
              `['${node.property.name}']`
            );
          },
        });
      },

      MethodDefinition(node) {
        if (node.computed || !node.key.name.endsWith('_')) {
          return;
        }

        context.report({
          node,
          message:
            'Unquoted private methods are not allowed in BaseElement. Please use quotes',
          fix(fixer) {
            return fixer.replaceText(node.key, `['${node.key.name}']`);
          },
        });
      },
    };
  },
};
