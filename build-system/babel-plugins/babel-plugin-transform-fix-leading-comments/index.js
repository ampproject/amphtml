/**
 * Reassigns the trailing comments of a statement to be leading comment of its
 * next sibling. This is because JSDoc comments (which should be on the next
 * statement) get erroneously assigned as trailing comments of this statement.
 *
 * @interface {babel.PluginPass}
 * @return {babel.PluginObj}
 */
module.exports = function () {
  return {
    manipulateOptions(_opts, parserOpts) {
      parserOpts.createParenthesizedExpressions = true;
    },

    visitor: {
      Statement(path) {
        const {node} = path;
        const {trailingComments} = node;
        if (!trailingComments || trailingComments.length <= 0) {
          return;
        }

        // Babel NodePath definition is missing getNextSibling
        const next = /** @type {babel.NodePath}*/ (
          /** @type {*} */ (path).getNextSibling()
        );
        if (!next) {
          return;
        }

        node.trailingComments = null;
        next.addComments('leading', /** @type {*} */ (trailingComments));
      },
    },
  };
};
