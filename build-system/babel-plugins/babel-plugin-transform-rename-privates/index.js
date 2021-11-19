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
    return function (path) {
      const key = path.get(field);
      if (!key.isIdentifier()) {
        return;
      }

      const {name} = key.node;
      if (keys.has(name)) {
        key.replaceWith(t.identifier(`${name}AMP_PRIVATE_`));
      }
    };
  }

  const keys = new Set();

  return {
    visitor: {
      Method: renamePrivate('key'),
      Property: renamePrivate('key'),
      MemberExpression: renamePrivate('property'),
      OptionalMemberExpression: renamePrivate('property'),

      // Gather all eligible keys eligible for mangling.
      Program(path) {
        path.traverse({
          AssignmentExpression(path, state) {
            if (!isAmpSrc(state)) {
              return;
            }
            const comments =
              /** @type {import("@babel/types").ExpressionStatement}*/ (
                path.parentPath.node
              )?.leadingComments?.join('') ?? '';

            if (!comments.includes('@private')) {
              return;
            }
            const lhs = path.node.left;

            if (!t.isMemberExpression(lhs)) {
              return;
            }
            if (lhs.computed) {
              return;
            }

            const ident = lhs.property;
            if (!t.isIdentifier(ident)) {
              return;
            }
            if (
              ident.name.endsWith('AMP_PRIVATE_') ||
              !ident.name.endsWith('_')
            ) {
              return;
            }
            keys.add(ident.name);
          },
        });
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
    throw new Error('Cannot use plugin without providing a filename');
  }
  return !(
    filename.startsWith('node_modules') || filename.startsWith('third_party')
  );
}
