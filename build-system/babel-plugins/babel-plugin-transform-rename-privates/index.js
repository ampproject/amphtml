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
      Identifier(path, state) {
        const filename = state.file.opts.filenameRelative;
        if (!filename) {
          throw new Error('Cannot use plugin without providing a filename');
        }

        const isAmpSrcCode =
          filename.startsWith('src/') || filename.startsWith('extensions/');
        if (!isAmpSrcCode) {
          return;
        }

        // If not within a class, then it isn't a private.
        // It could also be exported, which could cause issues.
        const isWithinClass =
          !path.parentPath.isClassDeclaration() &&
          !!path.findParent((p) => p.isClassDeclaration());
        if (!isWithinClass) {
          return;
        }

        const isProp =
          path.parent.type === 'MemberExpression' &&
          path.parent.object.type === 'ThisExpression';
        if (!isProp) {
          return false;
        }

        // AMP Privates are marked via trailing suffix.
        if (!path.node.name.endsWith('_')) {
          return;
        }

        path.node.name += `AMP_PRIVATE_`;
      },
    },
  };
};
