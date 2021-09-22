/**
 * Renames all private variables within AMP to end with AMP_PRIVATE_ for safe
 * identification later w/ terser. At that point it may be combined with files from 3p or node_modules,
 * where we cannot guarantee that the `_` suffix means private.
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

        // AMP Privates are marked via trailing suffix.
        if (!path.node.name.endsWith('_')) {
          return;
        }

        path.node.name += `AMP_PRIVATE_`;
      },
    },
  };
};
