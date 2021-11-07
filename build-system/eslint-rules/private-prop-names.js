'use strict';

/**
 * Enforces naming rules for private properties.
 *
 * @return {!Object}
 */
module.exports = function (context) {
  /**
   * @param {!Array<!Node>|undefined} commentLines
   * @return {boolean}
   */
  function hasPrivateAnnotation(commentLines) {
    if (!commentLines) {
      return false;
    }
    return commentLines.some(function (comment) {
      return comment.type == 'Block' && /@private/.test(comment.value);
    });
  }

  /**
   * @param {string}
   * @return {boolean}
   */
  function hasTrailingUnderscore(fnName) {
    return /_$/.test(fnName);
  }

  /**
   * @param {!Node}
   * @return {boolean}
   */
  function isThisMemberExpression(node) {
    return (
      node.type == 'MemberExpression' && node.object.type == 'ThisExpression'
    );
  }
  return {
    MethodDefinition: function (node) {
      if (
        hasPrivateAnnotation(context.getCommentsBefore(node)) &&
        !hasTrailingUnderscore(node.key.name || node.key.value)
      ) {
        context.report({
          node,
          message: 'Method marked as private but has no trailing underscore.',
        });
      }
    },
    AssignmentExpression: function (node) {
      if (
        node.parent.type == 'ExpressionStatement' &&
        hasPrivateAnnotation(context.getCommentsBefore(node.parent)) &&
        isThisMemberExpression(node.left) &&
        !hasTrailingUnderscore(
          node.left.property.name || node.left.property.value
        )
      ) {
        context.report({
          node,
          message: 'Property marked as private but has no trailing underscore.',
        });
      }
    },
  };
};
