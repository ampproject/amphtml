'use strict';

const imports = [
  {import: 'sinon', message: 'Importing sinon is forbidden'},
  {
    import: 'preact',
    message:
      "Please import preact from '#preact'. This allows us to support React too.",
  },
  {
    import: 'preact/hooks',
    message:
      "Please import preact/hooks from '#preact'. This allows us to support React too.",
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

      // "import type" is always fine.
      if (node.importKind === 'type') {
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
