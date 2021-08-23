import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

/**
 * Gets the config for post-closure babel transforms run during `amp dist`.
 *
 * @return {!Object}
 */
export function getPostClosureConfig() {
  const postClosurePlugins = [
    argv.esm || argv.sxg
      ? './build-system/babel-plugins/babel-plugin-const-transformer'
      : null,
    argv.esm || argv.sxg
      ? './build-system/babel-plugins/babel-plugin-transform-remove-directives'
      : null,
    argv.esm || argv.sxg
      ? './build-system/babel-plugins/babel-plugin-transform-stringish-literals'
      : null,
    './build-system/babel-plugins/babel-plugin-transform-minified-comments',
  ].filter(Boolean);

  return {
    compact: false,
    inputSourceMap: false,
    plugins: postClosurePlugins,
    retainLines: false,
    sourceMaps: true,
  };
}
