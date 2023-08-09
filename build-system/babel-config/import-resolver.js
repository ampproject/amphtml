'use strict';

const fs = require('fs');
const path = require('path');
const moduleResolver = require('babel-plugin-module-resolver');

const TSCONFIG_PATH = path.join(__dirname, '..', '..', 'tsconfig.base.json');
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
 * @return {!{[key: string]: string}}
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
 * Remap external modules that rely on React if building for Preact.
 * @param {'preact' | 'react'} buildFor
 * @return {object}
 */
function moduleAliases(buildFor) {
  if (buildFor === 'react') {
    return {};
  }
  return {
    'react': './src/react',
    'react-dom': './src/react/dom',
  };
}

/**
 * Import map configuration.
 * @param {'preact' | 'react' | null} buildFor determines whether to include preact or react aliases or neither. By default, uses preact aliases (in addition to jsconfig paths).
 * @return {object}
 */
function getImportResolver(buildFor = 'preact') {
  return {
    root: ['.'],
    alias: {
      ...readJsconfigPaths(),
      ...(buildFor ? moduleAliases(buildFor) : {}),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    stripExtensions: [],
    babelOptions: {
      caller: {
        name: 'import-resolver',
      },
    },
  };
}

/**
 * Produces an alias map with paths relative to the provided root.
 * @param {string} rootDir
 * @param {'preact' | 'react'} buildFor
 * @return {!{[key: string]: string}}
 */
function getRelativeAliasMap(rootDir, buildFor = 'preact') {
  return Object.fromEntries(
    Object.entries(getImportResolver(buildFor).alias).map(
      ([alias, destPath]) => [alias, path.join(rootDir, destPath)]
    )
  );
}

/**
 * Import resolver Babel plugin configuration.
 * @param {'preact' | 'react'} buildFor
 * @return {!Array}
 */
function getImportResolverPlugin(buildFor = 'preact') {
  return ['module-resolver', getImportResolver(buildFor)];
}

/**
 * Resolves a filepath using the same logic as the rest of our build pipeline (babel module-resolver).
 * The return value is a relative path from the amphtml folder.
 *
 * @param {string} filepath
 * @param {'preact' | 'react' | null} buildFor
 * @return {string}
 */
function resolvePath(filepath, buildFor = 'preact') {
  // 2nd arg is a file from which to make a relative path.
  // The actual file doesn't need to exist. In this case it is process.cwd()/anything
  return moduleResolver.resolvePath(
    filepath,
    'anything',
    getImportResolver(buildFor)
  );
}

module.exports = {
  getImportResolver,
  getImportResolverPlugin,
  getRelativeAliasMap,
  resolvePath,
};
