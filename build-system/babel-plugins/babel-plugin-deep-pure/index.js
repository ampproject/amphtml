const pureFnName = 'pure';

/** @return {import('@babel/core').PluginObj} */
module.exports = function () {
  /** @param {import('@babel/core').NodePath} path */
  function setIsPure(path) {
    path.addComment('leading', ' #__PURE__ ');
  }

  /**
   * @param {import('@babel/core').NodePath<import('@babel/types').CallExpression>} path
   * @return {boolean}
   */
  function isPureFnCallExpression(path) {
    return (
      path.node.arguments.length === 1 &&
      path.get('callee').isIdentifier({name: pureFnName})
    );
  }

  return {
    name: 'deep-pure',
    visitor: {
      CallExpression(path) {
        if (isPureFnCallExpression(path)) {
          path.traverse({
            NewExpression: setIsPure,
            CallExpression(path) {
              if (isPureFnCallExpression(path)) {
                path.replaceWith(path.node.arguments[0]);
              } else {
                setIsPure(path);
              }
            },
            MemberExpression(path) {
              throw path.buildCodeFrameError(
                `${pureFnName}() expressions cannot contain member expressions`
              );
            },
          });
          path.replaceWith(path.node.arguments[0]);
        }
      },
    },
  };
};
