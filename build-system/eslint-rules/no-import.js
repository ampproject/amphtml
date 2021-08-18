
'use strict';

const imports = [
  {import: 'sinon', message: 'Importing sinon is forbidden'},
  {
    import: 'preact',
    message:
      "Please import preact from 'src/preact'. This gives us type safety.",
  },
  {
    import: 'preact/hooks',
    message:
      "Please import preact/hooks from 'src/preact'. This gives us type safety.",
  },
];

module.exports = function (context) {
  return {
    ImportDeclaration(node) {
      const comments = context.getCommentsBefore(node.source);
      const ok = comments.some((comment) => comment.value === 'OK');
      if (ok) {
        return;
      }

      const name = node.source.value;

      for (const forbidden of imports) {
        const importSource = forbidden.import;
        if (name === importSource || name.startsWith(`${importSource}/`)) {
          context.report({
            node,
            message: forbidden.message,
          });
        }
      }
    },
  };
};
