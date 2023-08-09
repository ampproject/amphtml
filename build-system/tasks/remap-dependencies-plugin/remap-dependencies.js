const path = require('path');
const {resolvePath} = require('../../babel-config/import-resolver');

/**
 * Generates a plugin to remap the dependencies of a JS bundle.
 *
 * `remaps` is an object where each entry indicates that the module identified by the key should be remapped to the module identified by the value.
 *  Modules (in key or value) can be local modules (js/jsx/ts/tsx files in the repo) or npm modules (in the node_modules at the root of the repo).
 *  Local modules must be declared as a relative-path, relative to repo root, with a leading './' (e.g './mod1.js'). They don't need a file extension.
 *  Keys can use regex syntax.
 *
 * `externals` is a list of strings representing import paths that should be external-ized
 *
 * `resolve` is function that will return the absolute path of a module given the import path, directory of the importer, and repo root
 * @param {{remaps: Object, externals: Array<string>, resolve: AmpResolve}} remapDependenciesPluginConfig
 * @return {object}
 */
function remapDependenciesPlugin({externals, remaps, resolve}) {
  const remapArr = Object.entries(remaps).map(([path, value]) => ({
    regex: new RegExp(`^${path}(\\.[jt]sx?)?$`),
    value,
  }));
  const rootDir = process.cwd();

  return {
    name: 'remap-dependencies',
    setup(build) {
      build.onResolve({filter: /.*/}, (args) =>
        onResolveRemapDeps(
          {
            externals,
            remapArr,
            resolve,
            rootDir,
          },
          args
        )
      );
    },
  };
}

/**
 * Checks if the path that's being imported matches a declared remap.
 * If import path matches, returns correct path with info on if it's an external.
 * If not, returns undefined
 * @param {{externals: string[], remapArr: Array<*>, resolve: AmpResolve, rootDir: string}} remapConfig
 * @param {{resolveDir: string, path: string}} args
 * @return {*}
 */
function onResolveRemapDeps({externals, remapArr, resolve, rootDir}, args) {
  const {path: importPath, resolveDir} = args;

  // Construct candidate for remapping
  // If importing local module, must resolve module relative to repo-root and prefix with `./`
  // because local modules listed in `remap` keys use relative paths from the repo-root
  let dep;
  if (importPath.startsWith('.')) {
    const absPath = resolve(importPath, resolveDir, rootDir);
    dep = `.${path.posix.sep}${path.posix.relative(rootDir, absPath)}`;
  } else {
    dep = importPath;
  }

  for (const {regex, value} of remapArr) {
    if (!regex.test(dep)) {
      continue;
    }

    const isExternal = externals.includes(value);
    return {
      // resolve value from rootDir in case value is a local module (local module routes are relative to repo root)
      path: isExternal ? value : resolve(value, rootDir, rootDir),
      external: isExternal,
    };
  }
}

/**
 * @typedef {typeof ampResolve} AmpResolve
 */

/**
 * Resolves mostly arbitrary import paths to (node or local) modules.
 * Similar to require.resolve() but handles aliased paths and paths to non-js modules (jsx/ts/tsx).
 *
 * @param {string} importPath path to the import relative to importer
 * @param {string} absResolveDir absolute path to directory of the importer
 * @param {string} absRootDir absolute path to repo's root
 * @return {string} absolute path to import
 */
function ampResolve(importPath, absResolveDir, absRootDir) {
  const absImportPath = path.posix.join(absResolveDir, importPath);
  const rootRelImportPath = path.posix.relative(absRootDir, absImportPath);
  const babelResolvePath = resolvePath(rootRelImportPath, null);
  if (babelResolvePath) {
    return path.posix.join(absRootDir, babelResolvePath);
  } else {
    try {
      return require.resolve(importPath);
    } catch (e) {
      return path.posix.resolve(importPath);
    }
  }
}

module.exports = {
  remapDependenciesPlugin,
  ampResolve,
};
