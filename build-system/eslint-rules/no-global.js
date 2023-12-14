'use strict';

const astUtils = require('../../node_modules/eslint/lib/rules/utils/ast-utils');

const GLOBALS = Object.create(null);
GLOBALS.window = 'Use `self` instead.';
GLOBALS.document = 'Reference it as `self.document` or similar instead.';

module.exports = function (context) {
  return {
    Identifier: function (node) {
      const {name} = node;
      if (!(name in GLOBALS)) {
        return;
      }
      if (!/Expression/.test(node.parent.type)) {
        return;
      }

      if (
        node.parent.type === 'MemberExpression' &&
        node.parent.property === node
      ) {
        return;
      }

      const variable = astUtils.getVariableByName(
        context.getScope(),
        node.name
      );
      if (variable.defs.length > 0) {
        return;
      }

      let message = 'Forbidden global `' + node.name + '`.';
      if (GLOBALS[name]) {
        message += ' ' + GLOBALS[name];
      }
      context.report({node, message});
    },
  };
};
