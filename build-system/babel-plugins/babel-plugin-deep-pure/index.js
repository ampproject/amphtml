const {dirname, relative} = require('path');

const pureFnName = 'pure';
const pureFnImportSourceAliased = '#core/types/pure';
const pureFnImportSourceDirect = 'src/core/types/pure';

/**
 * Deeply adds #__PURE__ comments to an expression passed to a function named
 * `pure()`.
 * @return {import('@babel/core').PluginObj}
 */
module.exports = function () {
  let filename;
  let relativePureFnImportSource;

  /**
   * @param {import('@babel/core').NodePath<import('@babel/types').CallExpression>} path
   * @return {boolean}
   */
  function isPureFnCallExpression(path) {
    if (path.node.arguments.length !== 1) {
      return false;
    }
    const callee = path.get('callee');
    if (callee.referencesImport(pureFnImportSourceAliased, pureFnName)) {
      return true;
    }
    if (!relativePureFnImportSource) {
      if (!filename) {
        throw new Error(
          'babel-plugin-deep-pure must be called with a filename'
        );
      }
      relativePureFnImportSource = relative(
        dirname(filename),
        `${process.cwd()}/${pureFnImportSourceDirect}`
      );
    }
    return callee.referencesImport(relativePureFnImportSource, pureFnName);
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
      Program: {
        enter() {
          filename = this.file.opts.filename;
        },
      },
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
