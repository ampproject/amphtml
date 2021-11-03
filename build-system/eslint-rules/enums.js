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
    if (decl.init.type !== 'ObjectExpression') {
      context.report({
        node: decl.init || decl,
        message: 'Not initialized to a static object expression',
      });
      return;
    }

    checkEnumKeys(decl.init);
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
   */
  function checkEnumKeys(node) {
    for (const prop of node.properties) {
      if (prop.computed || prop.key.type !== 'Identifier') {
        context.report({
          node: prop,
          message: 'Enums key must be a normal prop identifier',
        });
      }
    }
  }

  return {
    Identifier(node) {
      if (!node.name.endsWith('_Enum')) {
        return;
      }
      const {parent} = node;
      if (parent.type === 'ImportSpecifier') {
        return;
      }
      if (parent.type === 'VariableDeclarator') {
        if (parent.id === node) {
          return;
        }
        if (parent.init === node && parent.id.type === 'ObjectPattern') {
          checkEnumKeys(parent.id);
          return;
        }
      }
      if (parent.type === 'MemberExpression') {
        if (parent.object === node && parent.computed === false) {
          return;
        }
      }
      if (parent.type === 'CallExpression') {
        const {arguments: args, callee} = parent;
        if (args[0] === node) {
          if (callee.type === 'Identifier') {
            const {name} = callee;
            if (
              name === 'isEnumValue' ||
              name === 'enumValues' ||
              name === 'enumKeys' ||
              name === 'enumToObject'
            ) {
              return;
            }
          }
        }
      }

      context.report({
        node,
        message: [
          `Improper use of enum, you may only do:`,
          `- \`${node.name}.key\` get access.`,
          `- \`isEnumValue(${node.name}, someValue)\` value checks.`,
          `- \`enumKeys(${node.name})\` keys gathering.`,
          `- \`enumValues(${node.name})\` values gathering.`,
          `- \`enumToObject(${node.name})\` conversion (AVOID if you can, it cannot be minified).`,
        ].join('\n\t'),
      });
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
