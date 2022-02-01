/**
 * Ensure comments in minified build output is minimal.
 *
 * @interface {babel.PluginPass}
 * @return {babel.PluginObj}
 */
module.exports = function () {
  return {
    visitor: {
      Statement(path) {
        const {node} = path;
        const {trailingComments} = node;
        if (trailingComments?.length) {
          node.trailingComments = trailingComments.map((comment) => ({
            ...comment,
            value: comment.value.replace(/\s+/g, ' '),
          }));

          const next = /** @type {*} */ (path).getNextSibling();
          if (next?.node) {
            next.node.leadingComments = null;
          }
        }
      },
    },
  };
};
