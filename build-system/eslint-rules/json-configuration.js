'use strict';

/**
 * Finds the jsonConfiguration helper function from src/core/types/object/json,
 * and performs validation on its input.
 */

module.exports = function (context) {
  const configurationCalls = ['jsonConfiguration', 'jsonLiteral'].map(
    (name) => `CallExpression[callee.name=${name}]`
  );

  /**
   * @param {*} node
   * @return {Object}
   */
  function verifyPath(node) {
    for (let n = node; n; n = n.parent) {
      const {parent} = n;
      const {type} = parent;

      if (type === 'ArrayExpression' || type === 'ObjectExpression') {
        continue;
      }

      if (type === 'Property' && parent.value === n) {
        continue;
      }

      if (type === 'CallExpression') {
        const {name} = parent.callee;
        if (name === 'jsonConfiguration' || name === 'jsonLiteral') {
          break;
        }
      }

      return context.report({
        node,
        message: 'Value must descend from object/array literals only.',
      });
    }
  }

  return {
    'CallExpression[callee.name=jsonConfiguration]': function (node) {
      const args = node.arguments;

      if (
        args.length === 1 &&
        (args[0].type === 'ObjectExpression' ||
          args[0].type === 'ArrayExpression')
      ) {
        return;
      }

      return context.report({
        node: args[0] || node,
        message:
          'Expected json configuration to pass in object or array literal',
      });
    },

    [`:matches(${configurationCalls}) * Identifier`]: function (node) {
      const {name, parent} = node;
      if (name === 'undefined') {
        return;
      }

      if (name === 'includeJsonLiteral') {
        return;
      }

      if (name in global) {
        return;
      }

      if (
        parent.type === 'CallExpression' &&
        parent.callee.name === 'includeJsonLiteral'
      ) {
        return;
      }

      if (
        parent.type === 'Property' &&
        parent.key === node &&
        !parent.computed
      ) {
        return;
      }

      if (
        parent.type === 'MemberExpression' &&
        parent.property === node &&
        !parent.computed
      ) {
        return;
      }

      context.report({
        node,
        message:
          'Unexpected dynamic reference inside json configuration object. Did you mean to use includeJsonLiteral?',
      });
    },

    'CallExpression[callee.name=jsonLiteral]': function (node) {
      const args = node.arguments;

      if (args.length === 1 && args[0].type !== 'Identifier') {
        return;
      }

      return context.report({
        node: args[0] || node,
        message:
          'Expected json literal to pass in literal boolean, string, number, object, or array. Did you pass a reference to one?',
      });
    },

    'CallExpression[callee.name=includeJsonLiteral]': function (node) {
      const args = node.arguments;

      if (args.length !== 1 || args[0].type !== 'Identifier') {
        return context.report({
          node: args[0] || node,
          message: 'Expected reference identifier to a json literal value',
        });
      }

      return verifyPath(node);
    },
  };
};
