'use strict';

/**
 * Forces `expect` calls to be preceded by `await` in end-to-end tests.
 *
 * Bad:
 *   expect(actual).to.equal(expected);
 * Good:
 *   await expect(actual).to.equal(expected);
 * @return {!Object}
 */
module.exports = function (context) {
  return {
    CallExpression(node) {
      const filename = context.getFilename();
      if (!/test-e2e|\/test\/e2e\//.test(filename)) {
        return;
      }

      const {callee} = node;
      if (callee.type !== 'Identifier') {
        return;
      }

      if (callee.name !== 'expect') {
        return;
      }

      const comments = context.getCommentsBefore(callee);
      const ok = comments.some((comment) => comment.value === 'OK');
      if (ok) {
        return;
      }

      if (hasAwaitParent(node)) {
        return;
      }

      context.report({
        node,
        message: '`expect` in end-to-end tests must use `await`.',
      });
    },
  };
};

/**
 * Returns true if the given espree AST node is a child of an `AwaitExpression`.
 * @param {!Object} node
 * @return {boolean}
 */
function hasAwaitParent(node) {
  while (node) {
    if (node.type == 'AwaitExpression') {
      return true;
    }
    node = node.parent;
  }
  return false;
}
