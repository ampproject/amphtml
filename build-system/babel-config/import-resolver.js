'use strict';

const fs = require('fs');
const path = require('path');
const {
  getMinifiedLocaleJsonFilename,
  isSourceLocaleJsonFilename,
} = require('../compile/minify-locale-json');
const {resolvePath} = require('babel-plugin-module-resolver');

const TSCONFIG_PATH = path.join(__dirname, '..', '..', 'tsconfig.json');
let tsConfigPaths = null;

/**
 * Reads import paths from tsconfig.json. This file is used by VSCode for
 * Intellisense/auto-import. Rather than duplicate and require updating both
 * files, we can read from it directly. JSConfig format looks like:
 * { compilerOptions: { paths: {
 *   '#foo/*': ['./src/foo/*'],
 *   '#bar/*': ['./bar/*'],
 * } } }
 * This method outputs the necessary alias object for the module-resolver Babel
 * plugin, which excludes the "/*" for each. The above paths would result in:
 * {
 *   '#foo': './src/foo',
 *   '#bar': './bar',
 * }
 * @return {!Object<string, string>}
 */
function readJsconfigPaths() {
  if (!tsConfigPaths) {
    const tsConfig = JSON.parse(fs.readFileSync(TSCONFIG_PATH, 'utf8'));
    const aliasPaths = tsConfig.compilerOptions.paths;

    const stripSuffix = (s) => s.replace(/\/\*$/, '');
    // eslint-disable-next-line local/no-deep-destructuring
    const aliases = Object.entries(aliasPaths).map(([alias, [dest]]) => [
      stripSuffix(alias),
      stripSuffix(dest),
    ]);

    tsConfigPaths = Object.fromEntries(aliases);
  }

  return tsConfigPaths;
}

/**
 * Import map configuration.
 * @param {boolean=} isProd
 * @return {!Object}
 */
function getImportResolver(isProd = false) {
  // Our custom resolvePath() is ignored unless we omit the alias config object.
  // We call the stock resolvePath() with the alias object in case a path
  // does not match our logic.
  const opts = {
    root: ['.'],
    babelOptions: {
      caller: {
        name: 'import-resolver',
      },
    },
  };
  const optsWithAlias = {
    alias: readJsconfigPaths(),
    ...opts,
  };
  return {
    ...opts,
    resolvePath(sourcePath, currentFile) {
      if (isProd && isSourceLocaleJsonFilename(sourcePath)) {
        return getMinifiedLocaleJsonFilename(sourcePath);
      }
      return resolvePath(sourcePath, currentFile, optsWithAlias);
    },
  };
}

/**
 * Produces an alias map with paths relative to the provided root.
 * @param {string} rootDir
 * @return {!Object<string, string>}
 */
function getRelativeAliasMap(rootDir) {
  return Object.fromEntries(
    Object.entries(getImportResolver().alias).map(([alias, destPath]) => [
      alias,
      path.join(rootDir, destPath),
    ])
  );
}

/**
 * Import resolver Babel plugin configuration.
 * @param {boolean=} isProd
 * @return {!Array}
 */
function getImportResolverPlugin(isProd) {
  return ['module-resolver', getImportResolver(isProd)];
}

module.exports = {
  getImportResolver,
  getImportResolverPlugin,
  getRelativeAliasMap,
};
