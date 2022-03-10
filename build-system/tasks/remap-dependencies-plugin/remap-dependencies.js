const path = require('path');
const {resolvePath} = require('../../babel-config/import-resolver');

/**
 * Generates a plugin to remap the dependencies of a JS bundle.
 * `remaps` is an object. The keys are regexes that match file path(s) relative to the root of the amphtml repo and the values are strings that used to replace imports to files that match their key.
 * `externals` is a list of strings representing import paths that should be external-ized
 * @param {{remaps: Object, externals: Array<string>, resolve?: *}} remapDependenciesPluginConfig
 * @return {Object}
 */
function remapDependenciesPlugin({externals, remaps, resolve = resolvePath}) {
  const remapArr = Object.entries(remaps).map(([path, value]) => ({
    regex: new RegExp(`^${path}(\.js|\.jsx|\.ts|\.tsx)?$`),
    value,
  }));
  return {
    name: 'remap-dependencies',
    setup(build) {
      build.onResolve(
        {filter: /.*/},
        onResolveRemapDeps.bind(undefined, {externals, remapArr, resolve})
      );
    },
  };
}

/**
 * @param {{externals: string, remapArr: Array<*>, resolve: *}} remapConfig
 * @param {{resolveDir: string, path: string}} args
 * @return {*}
 */
function onResolveRemapDeps({externals, remapArr, resolve}, args) {
  const {path: importPath, resolveDir} = args;

  let dep;
  if (importPath.startsWith('.')) {
    /**
     * Handles local imports by reconstructing the importPath's repo-relative path. Uses repo-relative import path to check if it matches any of the remap regexes.
     * Uses resolvePath() to handle directory imports and non-js imports (jsx, ts, tsx)
     */
    const absImportPath = path.posix.join(resolveDir, importPath);
    const rootDir = process.cwd();
    const rootRelativePath = path.posix.relative(rootDir, absImportPath);
    dep = resolve(rootRelativePath);
  } else {
    dep = importPath;
  }

  for (const {regex, value} of remapArr) {
    if (!regex.test(dep)) {
      continue;
    }

    const isExternal = externals.includes(value);
    return {
      path: isExternal ? value : resolve(value),
      external: isExternal,
    };
  }
}

module.exports = {
  remapDependenciesPlugin,
};
