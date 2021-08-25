'use strict';

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    return {
      ReturnStatement(node) {
        if (!/test/.test(context.getFilename())) {
          return;
        }
        let {parent} = node;
        if (parent.type !== 'BlockStatement') {
          return;
        }

        parent = parent.parent;
        if (!parent.type.includes('Function')) {
          return;
        }

        parent = parent.parent;
        if (parent.type !== 'CallExpression') {
          return;
        }

        const {callee} = parent;
        if (
          callee.type !== 'Identifier' ||
          callee.name !== 'allowConsoleError'
        ) {
          return;
        }

        const callParent = parent.parent;
        if (callParent.type === 'ReturnStatement') {
          return;
        }

        context.report({
          node: parent,
          message:
            'Must return allowConsoleError if callback contains a return',
          fix(fixer) {
            return fixer.insertTextBefore(parent, 'return ');
          },
        });
      },
    };
  },
};
