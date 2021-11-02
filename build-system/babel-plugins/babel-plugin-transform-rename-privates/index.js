/**
 * Renames all of AMP's class properties to have a unique suffix, `AMP_PRIVATE_`.
 * This acts as an indicator for terser to mangle the names even when combined with 3p files.
 *
 * @param {babel} babel
 * @interface {babel.PluginPass}
 * @return {babel.PluginObj}
 */
module.exports = function (babel) {
  const {types: t} = babel;

  /**
   * Adds trailing AMP_PRIVATE_ suffix to private identifiers.
   * @param {string} field
   * @return {function(*, *):void}
   */
  function renamePrivate(field) {
    return function (path, state) {
      if (!isAmpSrc(state)) {
        return;
      }
      if (path.node.computed) {
        return;
      }

      const key = path.get(field);
      if (!key.isIdentifier()) {
        return;
      }

      const {name} = key.node;
      if (name.endsWith('_AMP_PRIVATE_')) {
        return;
      }

      if (!name.endsWith('_')) {
        return;
      }
      key.replaceWith(t.identifier(`${name}AMP_PRIVATE_`));
    };
  }

  /**
   * @param {string} field
   * @param {*} path
   */
  function renameEnum(field, path) {
    const key = path.get(field);
    if (!key.isIdentifier()) {
      return;
    }

    const {name} = key.node;
    if (name.endsWith('_AMP_ENUM_KEY_')) {
      return;
    }

    key.replaceWith(t.identifier(`${name}_AMP_ENUM_KEY_`));
  }

  /**
   * @param {*} path
   */
  function renameKeys(path) {
    for (const prop of path.get('properties')) {
      renameEnum('key', prop);
    }
  }

  return {
    visitor: {
      Method: renamePrivate('key'),
      Property: renamePrivate('key'),
      VariableDeclarator(path) {
        const id = path.get('id');
        if (!id.isIdentifier()) {
          return;
        }
        if (!id.node.name.endsWith('_ENUM')) {
          return;
        }
        renameKeys(path.get('declarations.0.init'));
      },

      MemberExpression(path, state) {
        renamePrivate('property')(path, state);
        const obj = path.get('object');
        if (!obj.isIdentifier()) {
          return;
        }
        if (!obj.node.name.endsWith('_ENUM')) {
          return;
        }
        renameEnum('property', path);
      },
      OptionalMemberExpression: renamePrivate('property'),
    },
  };
};

/**
 * @param {*} state
 * @return {boolean}
 */
function isAmpSrc(state) {
  const filename = state.file.opts.filenameRelative;
  if (!filename) {
    return true;
    throw new Error('Cannot use plugin without providing a filename');
  }
  return !(
    filename.startsWith('node_modules') || filename.startsWith('third_party')
  );
}
