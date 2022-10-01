'use strict';

/**
 * Enforces naming rules for camelCase rules forbidding `_` (unless leading or trailing).
 *
 * @return {!Object}
 */
module.exports = function (context) {
  return {
    Identifier(node) {
      let name = node.name.replace(/^_+|_+$/g, '');

      // allow SCREAMING_SNAKE_CASE
      if (name === name.toUpperCase()) {
        return;
      }
      if (name === 'var_args') {
        return;
      }

      if (name.startsWith('opt_')) {
        name = name.slice('opt_'.length);
      }
      if (name.endsWith('_Enum')) {
        name = name.slice(0, -'_Enum'.length);
      }

      if (!name.includes('_')) {
        return;
      }

      // Excuse membership access, unless we're in the LHS of an assignment.
      // This attempts to prevent us from defining new properties with underscores,
      // while allowing access to external objects that already have them.
      // This mirrors google-camelcase's logic.
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

      // Permit object destructuring, since that is similar to membership access.
      // Requires that the key is immediately renamed to a conforming value.
      if (
        parent.type === 'Property' &&
        parent.parent.type === 'ObjectPattern' &&
        parent.key === node
      ) {
        return;
      }

      context.report({
        node,
        message: `"${node.name}" must use camelCaseCapitalization.`,
      });
    },
  };
};
