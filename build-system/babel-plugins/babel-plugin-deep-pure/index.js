const pureFnName = 'pure';
const pureFnImportSourceRe = new RegExp(
  '(^#|/)core/types/pure(\\.{js,jsx,ts,tsx})?$'
);

/**
 * Deeply adds #__PURE__ comments to an expression passed to a function named
 * `pure()`.
 * @param {import('@babel/core')} babel
 * @return {import('@babel/core').PluginObj}
 */
module.exports = function (babel) {
  const {types: t} = babel;

  /**
   * @param {import('@babel/core').NodePath} path
   * @return {boolean}
   */
  function referencesPureFnImport(path) {
    if (!path.isIdentifier()) {
      return false;
    }
    const binding = path.scope.getBinding(path.node.name);
    if (!binding || binding.kind !== 'module') {
      return false;
    }
    const bindingPath = binding.path;
    const parent = bindingPath.parentPath;
    if (
      !parent?.isImportDeclaration() ||
      !pureFnImportSourceRe.test(parent?.node.source.value)
    ) {
      return false;
    }
    return (
      bindingPath.isImportSpecifier() &&
      t.isIdentifier(bindingPath.node.imported, {name: pureFnName})
    );
  }

  /**
   * @param {import('@babel/core').NodePath<import('@babel/types').CallExpression>} path
   * @return {boolean}
   */
  function isPureFnCallExpression(path) {
    return (
      path.node.arguments.length === 1 &&
      referencesPureFnImport(path.get('callee'))
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
