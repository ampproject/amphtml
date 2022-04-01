/** @return {import('@babel/core').PluginObj} */
module.exports = function () {
  /** @param {import('@babel/core').NodePath} path */
  function setIsPure(path) {
    path.addComment('leading', ' #__PURE__ ');
  }
  return {
    name: 'deep-pure',
    visitor: {
      CallExpression(path) {
        if (
          path.node.arguments.length === 1 &&
          path.get('callee').isIdentifier({name: 'pure'})
        ) {
          path.replaceWith(path.node.arguments[0]);
          path.traverse({
            NewExpression: setIsPure,
            MemberExpression: setIsPure,
            CallExpression: setIsPure,
          });
        }
      },
    },
  };
};
