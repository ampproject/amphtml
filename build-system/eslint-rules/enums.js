'use strict';

/**
 * Enforces naming rules for enums.
 *
 * @return {!Object}
 */
module.exports = function (context) {
  /**
   * @param {!Node} node
   * @return {boolean}
   */
  function hasEnumAnnotation(node) {
    const commentLines = context.getCommentsBefore(node);
    if (!commentLines) {
      return false;
    }

    return commentLines.some(function (comment) {
      return comment.type == 'Block' && /@enum/.test(comment.value);
    });
  }

  /**
   * @param {!Node} node
   */
  function check(node) {
    if (node.declarations.length > 1) {
      context.report({
        node,
        message: 'Too many variables defined in declaration',
      });
      return;
    }

    const decl = node.declarations[0];
    checkInit(decl.init, decl);
    checkId(decl.id);
  }

  /**
   * @param {!Node|undefined} node
   */
  function checkId(node) {
    if (node.type !== 'Identifier') {
      context.report({
        node,
        message: 'Must be assigned to simple identifier',
      });
      return;
    }

    if (!/^[A-Z0-9_]+_ENUM$/.test(node.name)) {
      context.report({
        node,
        message: 'Must use all caps with trailing "_ENUM"',
      });
      return;
    }
  }

  /**
   * @param {!Node|undefined} node
   * @param {!Node} reportNode
   */
  function checkInit(node, reportNode) {
    if (node?.type !== 'ObjectExpression') {
      context.report({
        node: node || reportNode,
        message: 'Not initialized to a static object expression',
      });
    }
  }

  return {
    VariableDeclaration(node) {
      if (!hasEnumAnnotation(node)) {
        return;
      }

      check(node);
    },

    ExportNamedDeclaration(node) {
      if (!hasEnumAnnotation(node)) {
        return;
      }
      if (!node.declaration) {
        return context.report({
          node,
          message: 'Exported enum does not define enum',
        });
      }

      check(node.declaration);
    },
  };
};
