'use strict';

module.exports = function (context) {
  return {
    CallExpression(node) {
      if (/test-/.test(context.getFilename())) {
        return;
      }

      const {callee} = node;
      if (callee.type !== 'MemberExpression') {
        return;
      }

      const {property} = callee;
      if (property.type !== 'Identifier' || property.name !== 'vsyncFor') {
        return;
      }

      const leadingComments = context.getCommentsBefore(property);
      const ok = leadingComments.some((comment) => {
        return comment.value === 'OK';
      });
      if (ok) {
        return;
      }

      context.report({
        node,
        message: [
          'VSync is now a privileged service.',
          'You likely want to use the `BaseElement` methods' +
            ' `measureElement`, `mutateElement`, or `runElement`.',
          'In the worst case use the same methods on `Resources`.',
        ].join('\n\t'),
      });
    },
  };
};
