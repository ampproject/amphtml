'use strict';

module.exports = {
  meta: {
    fixable: 'code',
  },

  create(context) {
    const oror = 'LogicalExpression[operator="||"]';
    const andand = 'LogicalExpression[operator="&&"]';

    return {
      [`${oror} > ${andand}`](node) {
        const sourceCode = context.getSourceCode();
        const before = sourceCode.getTokenBefore(node);
        const after = sourceCode.getTokenAfter(node);
        if (before && before.value === '(' && after && after.value === ')') {
          return;
        }

        context.report({
          node,
          message:
            'Detected mixed use of "&&" with "||" without' +
            ' parenthesizing "(a && b)".',
          fix(fixer) {
            return [
              fixer.insertTextAfter(node, ')'),
              fixer.insertTextBefore(node, '('),
            ];
          },
        });
      },
    };
  },
};
