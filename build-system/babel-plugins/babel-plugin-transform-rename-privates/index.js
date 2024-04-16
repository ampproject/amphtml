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
   * @return {function(*,*):void}
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

      const {node} = key;
      const {name} = node;
      if (name.endsWith('_AMP_PRIVATE_')) {
        return;
      }

      if (!name.endsWith('_') || name === '__proto__') {
        return;
      }
      key.replaceWith(t.inherits(t.identifier(`${name}AMP_PRIVATE_`), node));
    };
  }

  return {
    visitor: {
      Method: renamePrivate('key'),
      Property: renamePrivate('key'),
      MemberExpression: renamePrivate('property'),
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
    throw new Error('Cannot use plugin without providing a filename');
  }
  return !(
    filename.startsWith('node_modules') || filename.startsWith('third_party')
  );
}
