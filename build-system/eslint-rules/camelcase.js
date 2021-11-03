'use strict';

/**
 * Enforces naming rules for camelCase rules forbidding `_` (unless leading or trailing).
 *
 * @return {!Object}
 */
module.exports = function (context) {
  return {
    Identifier(node) {
      const name = node.name.replace(/^_+|_+$/g, '');

      // allow SCREAMING_SNAKE_CASE
      if (name === name.toUpperCase()) {
        return;
      }
      if (name.startsWith('opt_')) {
        return;
      }
      if (name === 'var_args') {
        return;
      }
      if (name.endsWith('_Enum')) {
        return;
      }

      // Excuse membership access, unless we're in the LHS of an assignment.
      const {parent} = node;
      if (parent.type === 'MemberExpression' && parent.property === node) {
        const grandParent = parent.parent;
        if (
          !(
            grandParent.type === 'AssignmentExpression' &&
            grandParent.left === parent
          )
        ) {
          return;
        }
      }

      if (name.includes('_')) {
        context.report({
          node,
          message: `"${node.name}" must use camelCaseCapitalization.`,
        });
      }
    },
  };
};
