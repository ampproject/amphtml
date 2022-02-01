/**
 * @interface {babel.PluginPass}
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function (babel) {
  const {types: t} = babel;
  return {
    visitor: {
      Expression: {
        exit(path) {
          const {node} = path;
          const {parenthesized} = node.extra || {};
          if (!parenthesized) {
            return;
          }

          path.replaceWith(t.parenthesizedExpression(node));
          path.skip();
        },
      },
    },
  };
};
