// @ts-nocheck

/**
 * Changes the values of getMode().test, getMode().localDev to false
 * and getMode().localDev to true.
 * @param {object} babelTypes
 */
const {dirname, join, relative, resolve} = require('path').posix;

// This plugin is only executed when bundling for production builds (minified).
module.exports = function ({types: t}) {
  let getModeFound = false;
  return {
    visitor: {
      ImportDeclaration({node}, state) {
        const {source, specifiers} = node;
        if (!source.value.endsWith('/mode')) {
          return;
        }
        specifiers.forEach((specifier) => {
          if (specifier.imported && specifier.imported.name === 'getMode') {
            const filepath = relative(
              join(__dirname, '../../../'),
              resolve(dirname(state.file.opts.filename), source.value)
            );
            if (filepath.endsWith('src/mode')) {
              getModeFound = true;
            }
          }
        });
      },
      MemberExpression(path) {
        if (!getModeFound) {
          return;
        }

        const {node} = path;
        const {object: obj, property} = node;
        const {callee} = obj;
        const {INTERNAL_RUNTIME_VERSION: version, IS_ESM} = this.opts;

        if (callee && callee.name === 'getMode') {
          if (property.name === 'test' || property.name === 'localDev') {
            path.replaceWith(t.booleanLiteral(false));
          } else if (property.name === 'development' && IS_ESM) {
            path.replaceWith(t.booleanLiteral(false));
          } else if (property.name === 'minified') {
            path.replaceWith(t.booleanLiteral(true));
          } else if (property.name === 'version') {
            path.replaceWith(t.stringLiteral(version));
          }
        }
      },
      CallExpression(path) {
        const {INTERNAL_RUNTIME_VERSION: version} = this.opts;
        if (path.get('callee').referencesImport('#core/mode', 'version')) {
          path.replaceWith(t.stringLiteral(version));
        }
      },
    },
  };
};
