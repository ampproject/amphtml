const pureFnName = 'pure';
const pureFnImportSource = '#core/types/pure';

/**
 * Deeply adds #__PURE__ comments to an expression passed to a function named
 * `pure()`.
 * @return {import('@babel/core').PluginObj}
 */
module.exports = function () {
  /**
   * @param {import('@babel/core').NodePath<import('@babel/types').CallExpression>} path
   * @return {boolean}
   */
  function isPureFnCallExpression(path) {
    return (
      path.node.arguments.length === 1 &&
      path.get('callee').referencesImport(pureFnImportSource, pureFnName)
    );
  }

  /** @param {import('@babel/core').NodePath} path */
  function addPureComment(path) {
    path.addComment('leading', ' #__PURE__ ');
  }

  /** @param {import('@babel/core').NodePath<import('@babel/types').CallExpression>} path */
  function replaceWithFirstArgument(path) {
    path.replaceWith(path.node.arguments[0]);
  }

  return {
    name: 'deep-pure',
    visitor: {
      CallExpression(path) {
        if (isPureFnCallExpression(path)) {
          path.traverse({
            NewExpression(path) {
              addPureComment(path);
            },
            CallExpression(path) {
              if (isPureFnCallExpression(path)) {
                replaceWithFirstArgument(path);
              } else {
                addPureComment(path);
              }
            },
            MemberExpression(path) {
              throw path.buildCodeFrameError(
                `${pureFnName}() expressions cannot contain member expressions`
              );
            },
          });
          replaceWithFirstArgument(path);
        }
      },
    },
  };
};
