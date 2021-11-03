'use strict';

const camelcase = require('lodash.camelcase');

/* eslint-disable */

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
    checkEnumId(decl.id);
  }

  /**
   * @param {!Node|undefined} node
   */
  function checkEnumId(node) {
    if (node.type !== 'Identifier') {
      context.report({
        node,
        message: 'Must be assigned to simple identifier',
      });
      return;
    }

    if (!/^[A-Z][A-Za-z0-9]+_Enum$/.test(node.name)) {
      context.report({
        node,
        message: 'Enums muse use PascalCaseCapitalization and end in "_Enum"',
      });
      return;
    }
  }

  /**
   * @param {!Node} node
   */
  function checkNonEnumIds(node) {
    if (!node.declarations) {
      return;
    }
    for (const decl of node.declarations) {
      const {id} = decl;
      if (id.type !== 'Identifier') {
        continue;
      }

      if (id.name.endsWith('_Enum')) {
        context.report({
          node: decl,
          message: 'Must not mark non-enum as _Enum',
        });
      }
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
    Identifier(node) {
      if (node.name.endsWith('_ENUM')) {
        context.report({
          node,
          message: 'use pascal case',
          fix(fixer) {
            let newName = camelcase(node.name);
            newName = newName[0].toUpperCase() + newName.slice(1);
            newName = newName.replace(/Enum$/, '_Enum');
            return fixer.replaceText(node, newName);
          },
        })
      }
    },

    VariableDeclaration(node) {
      let annotationNode = node;
      const {parent} = node;
      if (parent.type === 'ExportNamedDeclaration') {
        annotationNode = parent;
      }

      if (hasEnumAnnotation(annotationNode)) {
        check(node);
      } else {
        checkNonEnumIds(node);
      }
    },
  };
};
