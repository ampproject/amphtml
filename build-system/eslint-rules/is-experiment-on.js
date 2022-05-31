'use strict';

module.exports = function (context) {
  const isExperimentOn = 'CallExpression[callee.name=isExperimentOn]';
  const message = 'isExperimentOn must be passed an explicit string';

  return {
    [isExperimentOn](node) {
      const arg = node.arguments[1];
      if (!arg) {
        context.report({node, message});
        return;
      }

      const comments = context.getCommentsBefore(arg);
      const ok = comments.some((comment) => comment.value === 'OK');
      if (ok) {
        return;
      }

      if (arg.type === 'Literal' && typeof arg.value === 'string') {
        return;
      }

      context.report({node, message});
    },
  };
};
