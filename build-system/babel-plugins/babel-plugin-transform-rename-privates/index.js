/**
 * Renames all of AMP's class properties to have a unique suffix, `AMP_PRIVATE_`.
 * This acts as an indicator for terser to mangle the names even when combined with 3p files.
 *
 * @interface {babel.PluginPass}
 * @return {babel.PluginObj}
 */
module.exports = function () {
  return {
    visitor: {
      OptionalMemberExpression(path, state) {
        if (!isAmpSrc(state)) {
          return;
        }
        maybeAppendSuffix(path.node.property);
      },
      MemberExpression(path, state) {
        if (!isAmpSrc(state)) {
          return;
        }
        maybeAppendSuffix(path.node.property);
      },
      Method(path, state) {
        if (!isAmpSrc(state)) {
          return;
        }
        maybeAppendSuffix(path.node.key);
      },
      Property(path, state) {
        if (!isAmpSrc(state)) {
          return;
        }
        maybeAppendSuffix(path.node.key);
      },
    },
  };
};

/**
 * @param {*} state
 * @return {string}
 */
function isAmpSrc(state) {
  const filename = state.file.opts.filenameRelative;
  if (!filename) {
    throw new Error('Cannot use plugin without providing a filename');
  }
  return filename.startsWith('src/') || filename.startsWith('extensions/');
}

/**
 * Adds trailing AMP_PRIVATE_ suffix to an identifier.
 * @param {babel.types.Node} ident
 */
function maybeAppendSuffix(ident) {
  if (ident.type !== 'Identifier') {
    return;
  }

  // AMP Privates are marked via trailing suffix.
  if (!ident.name.endsWith('_')) {
    return;
  }

  ident.name += 'AMP_PRIVATE_';
}
