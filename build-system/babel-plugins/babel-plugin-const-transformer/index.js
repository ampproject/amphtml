/**
 * @interface {babel.PluginPass}
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function ({types: t}) {
  return {
    visitor: {
      VariableDeclaration(path) {
        if (path.node.kind !== 'const') {
          return;
        }

        path.replaceWith(t.variableDeclaration('let', path.node.declarations));
      },
    },
  };
};
