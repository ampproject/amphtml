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
   * @param {string} name
   * @return {boolean}
   */
  function isRenamed(name) {
    return name.endsWith('_AMP_PRIVATE_') || name.endsWith('_AMP_ENUM_KEY_');
  }

  /**
   * @param {babel.types.Identifier} id
   * @return {boolean}
   */
  function isEnum(id) {
    return /_E(NUM|num)$/.test(id.name);
  }

  /**
   * Adds trailing AMP_PRIVATE_ suffix to private identifiers.
   * @param {string} field
   * @param {*} path
   */
  function renamePrivate(field, path) {
    if (path.node.computed) {
      return;
    }

    const key = path.get(field);
    if (!key.isIdentifier()) {
      return;
    }

    const {name} = key.node;
    if (isRenamed(name)) {
      return;
    }

    if (!name.endsWith('_')) {
      return;
    }
    key.replaceWith(t.identifier(`${name}AMP_PRIVATE_`));
  }

  /**
   * @param {string} field
   * @param {*} path
   */
  function renameEnum(field, path) {
    if (path.node.computed) {
      return;
    }

    const key = path.get(field);
    if (!key.isIdentifier()) {
      return;
    }

    const {name} = key.node;
    if (isRenamed(name)) {
      return;
    }

    key.replaceWith(t.identifier(`${name}_AMP_ENUM_KEY_`));
  }

  /**
   * @param {*} path
   */
  function renameEnumKeys(path) {
    for (const prop of path.get('properties')) {
      renameEnum('key', prop);
    }
  }

  /**
   * @param {*} path
   * @param {*} state
   */
  function Member(path, state) {
    if (!isAmpSrc(state)) {
      return;
    }
    renamePrivate('property', path);

    const obj = path.get('object');
    if (!obj.isIdentifier()) {
      return;
    }
    if (!isEnum(obj.node)) {
      return;
    }
    renameEnum('property', path);
  }

  return {
    visitor: {
      Method(path, state) {
        if (!isAmpSrc(state)) {
          return;
        }
        renamePrivate('key', path);
      },

      Property(path, state) {
        if (!isAmpSrc(state)) {
          return;
        }
        renamePrivate('key', path);
      },

      MemberExpression: Member,
      OptionalMemberExpression: Member,

      VariableDeclarator(path) {
        const id = path.get('id');
        const init = path.get('init');
        if (id.isIdentifier()) {
          if (!init.isObjectExpression()) {
            return;
          }
          if (!isEnum(id.node)) {
            return;
          }
          renameEnumKeys(path.get('init'));
        }

        if (id.isObjectPattern()) {
          if (!init.isIdentifier()) {
            return;
          }
          if (!isEnum(init.node)) {
            return;
          }
          renameEnumKeys(id);
        }
      },
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
