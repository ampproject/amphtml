'use strict';

module.exports = function (context) {
  const listenMethodNames = [
    'listen',
    'listenPromise',
    'listenOnce',
    'listenOncePromise',
  ];
  const listenCall = listenMethodNames
    .map((m) => `CallExpression[callee.name=${m}]`)
    .join(',');
  const addEventListenerCall =
    'CallExpression[callee.property.name=addEventListener]';
  const call = `${listenCall},${addEventListenerCall}`;

  const displayMessage = [
    'Do not add "unload" or "beforeunload" listeners because they break the back/forward cache.',
    'Use the "pagehide" event instead, and if needed check `!event.persisted`.',
  ].join('\n\t');

  return {
    [call]: function (node) {
      const {callee} = node;
      const {name} = callee;
      const argIndex = name && name.lastIndexOf('listen', 0) == 0 ? 1 : 0;
      const arg = node.arguments[argIndex];
      if (!arg) {
        return;
      }

      const comments = context.getCommentsBefore(arg);
      const ok = comments.some((comment) => comment.value === 'OK');
      if (ok) {
        return;
      }

      const {type, value} = arg;
      if (type !== 'Literal' || typeof value !== 'string') {
        return;
      }

      if (value === 'unload' || value === 'beforeunload') {
        context.report({
          node: arg,
          message: displayMessage,
        });
      }
    },
  };
};
