// @ts-nocheck

/**
 * @interface {babel.PluginPass}
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function (babel) {
  const {types: t} = babel;
  return {
    name: 'transform-amp-extension-call',
    visitor: {
      CallExpression(path) {
        const {node} = path;
        const {callee} = node;
        if (
          t.isIdentifier(callee.object, {name: 'AMP'}) &&
          t.isIdentifier(callee.property, {name: 'extension'})
        ) {
          const {body} = node.arguments[node.arguments.length - 1];

          if (t.isBlockStatement(body)) {
            path.replaceWithMultiple(body.body);
          } else {
            path.replaceWith(body);
          }
        }
      },
    },
  };
};
