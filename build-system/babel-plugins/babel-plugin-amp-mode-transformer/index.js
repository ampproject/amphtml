// @ts-nocheck

/**
 * Changes the values of getMode().test, getMode().localDev to false
 * and getMode().localDev to true.
 * @param {Object} babelTypes
 */
const {dirname, join, relative, resolve} = require('path').posix;

/** @typedef {import('../../compile/build-constants').BUILD_CONSTANTS} BuildConstantsDef */

/**
 * This plugin is only executed when bundling for production builds (minified).
 *
 * @interface {babel.PluginPass}
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function ({types: t}) {
  let getModeFound = false;
  return {
    visitor: {
      ImportDeclaration({node}, state) {
        const {source, specifiers} = node;
        const {filename} = state.file.opts;

        if (!filename) {
          throw new Error(
            'babel-plugin-amp-mode-transformer must be called with a filename'
          );
        }

        if (!source.value.endsWith('/mode')) {
          return;
        }

        specifiers.forEach((specifier) => {
          if (specifier.type !== 'ImportSpecifier') {
            return;
          }

          const name =
            specifier.imported.type === 'Identifier'
              ? specifier.imported.name
              : specifier.imported.value;
          if (name === 'getMode') {
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

        const {node} = path;
        const {object: obj, property} = node;
<<<<<<< HEAD
        const {callee} = obj;
        const {INTERNAL_RUNTIME_VERSION: version, IS_ESM} = this.opts;
=======
        const {callee} = /** @type {babel.types.CallExpression} */ (obj);
        const {INTERNAL_RUNTIME_VERSION: version} =
          /** @type {BuildConstantsDef} */ (this.opts);
>>>>>>> 2b57012068 (typecheck babel plugin: amp-mode-transformer)

        if (callee.type === 'Identifier' && callee.name === 'getMode') {
          const propertyName = property.type === 'Identifier' && property.name;
          if (propertyName === 'test' || propertyName === 'localDev') {
            path.replaceWith(t.booleanLiteral(false));
<<<<<<< HEAD
          } else if (property.name === 'development' && IS_ESM) {
=======
          } else if (propertyName === 'development') {
>>>>>>> 2b57012068 (typecheck babel plugin: amp-mode-transformer)
            path.replaceWith(t.booleanLiteral(false));
          } else if (propertyName === 'minified') {
            path.replaceWith(t.booleanLiteral(true));
          } else if (propertyName === 'version') {
            path.replaceWith(t.stringLiteral(String(version)));
          }
        }
      },
      CallExpression(path) {
        const {INTERNAL_RUNTIME_VERSION: version} =
          /** @type {BuildConstantsDef} */ (this.opts);
        if (path.get('callee').referencesImport('#core/mode', 'version')) {
          path.replaceWith(t.stringLiteral(String(version)));
        }
      },
    },
  };
};
