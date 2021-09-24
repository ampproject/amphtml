const {dirname, join, relative, resolve} = require('path').posix;

/**
 * @typedef {typeof import('../../compile/build-constants').BUILD_CONSTANTS} ModeTransformerOptions
 */

/**
 * This plugin is only executed when bundling for production builds (minified).
 *
 * Changes the values of getMode().test, getMode().localDev to false
 * and getMode().localDev to true.
 *
 * @interface {babel.PluginPass}
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function (babel) {
  const {types: t} = babel;
  let getModeFound = false;
  return {
    visitor: {
      ImportDeclaration({node}, state) {
        const {filename} = state.file.opts;
        if (!filename) {
          throw new Error('Plugin requires filename.');
        }

        const {source, specifiers} = node;
        if (!source.value.endsWith('/mode')) {
          return;
        }
        specifiers.forEach((specifier) => {
          if (
            specifier.type !== 'ImportSpecifier' ||
            specifier.imported.type !== 'Identifier'
          ) {
            return;
          }

          if (specifier.imported.name === 'getMode') {
            const filepath = relative(
              join(__dirname, '../../../'),
              resolve(dirname(filename), source.value)
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
        const {INTERNAL_RUNTIME_VERSION: version, IS_ESM} =
          /** @type {ModeTransformerOptions} */ (this.opts);
        const {node} = path;
        const {object: obj, property} = node;
        if (
          property.type !== 'Identifier' ||
          !('callee' in obj) ||
          obj.callee.type !== 'Identifier'
        ) {
          return;
        }
        const {callee} = obj;

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
        const {INTERNAL_RUNTIME_VERSION: version} =
          /** @type {ModeTransformerOptions} */ (this.opts);

        if (path.get('callee').referencesImport('#core/mode', 'version')) {
          path.replaceWith(t.stringLiteral(version));
        }
      },
    },
  };
};
