const babelTypes = require('@babel/types');
const {parse} = require('@babel/parser');
const {resolvePath} = require('../babel-config/import-resolver');
const {lstatSync, readFileSync} = require('fs-extra');
const {once} = require('../common/once');
const {bentoBundles} = require('./bundles.config');
const glob = require('globby');
const {getNameWithoutComponentPrefix} = require('../tasks/bento-helpers');

/**
 * @param {string} path
 * @return {?string}
 */
function resolveExactModuleFile(path) {
  let unaliased = resolvePath(path);
  try {
    if (lstatSync(unaliased).isDirectory()) {
      unaliased += '/index';
    }
  } catch {
    // lstat fails if not directory
  }
  const result = glob.sync(`${unaliased}.{js,jsx,ts,tsx}`);
  if (result.length !== 1) {
    return null;
  }
  return result[0];
}

/**
 * @param {string} filename
 * @return {string[]}
 */
function getExportAll(filename) {
  const source = readFileSync(filename, 'utf8');
  const tree = parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'exportDefaultFrom'],
  });
  const modules = [];
  for (const node of tree.program.body) {
    if (babelTypes.isExportAllDeclaration(node)) {
      modules.push(node.source.value);
    } else if (babelTypes.isExportDefaultDeclaration(node)) {
      throw new Error(`${filename} should not "export default"`);
    } else if (babelTypes.isExportNamedDeclaration(node)) {
      throw new Error(`${filename} should not export named symbol`);
    }
  }
  return modules;
}

/** @typedef {{source: string, cdn?: string, npm?: string}} */
let MappingEntryDef;

/** @return {MappingEntryDef[]}}} */
const getAllRemappings = once(() => {
  // IMPORTANT: cdn mappings must start with ./dist/

  // Determine modules to import from shared bento.mjs.
  const coreBentoModules = getExportAll('src/bento/bento.js');
  const coreBentoRemappings = coreBentoModules.map((source) => ({
    source,
    cdn: '../bento.mjs',
    npm: '@bentoproject/core',
  }));

  // Allow component cross-dependency
  const componentRemappings = bentoBundles.map(({name, version}) => ({
    source: `./src/bento/components/${name}/${version}/${name}`,
    cdn: `./${name}-${version}.mjs`,
    npm: `@bentoproject/${getNameWithoutComponentPrefix(name)}`,
  }));

  return /** @type {MappingEntryDef[]} */ (
    [...coreBentoRemappings, ...componentRemappings]
      .map(({cdn, npm, source}) => {
        const resolved = resolveExactModuleFile(source);
        if (resolved) {
          return {source: resolved, cdn, npm};
        }
      })
      .filter(Boolean)
  );
});

/**
 * @param {'npm'|'cdn'} type
 * @return {{[string: string]: string}}
 */
function getRemappings(type) {
  return /** @type {{[string: string]: string}} */ (
    Object.fromEntries(
      getAllRemappings()
        .filter((mapping) => mapping[type])
        .map((mapping) => [mapping.source, mapping[type]])
    )
  );
}

/**
 * Remaps imports from source to externals.
 * @param {string} isMinified
 * @return {{[string: string]: string}}
 */
function getRemapBentoDependencies(isMinified) {
  const remappings = getRemappings('cdn');
  if (isMinified) {
    return remappings;
  }
  return Object.fromEntries(
    Object.entries(isMinified).map(([source, cdn]) => [
      source,
      cdn.replace('.mjs', '.max.mjs'),
    ])
  );
}

/**
 * Remaps imports from source to externals.
 * @return {{[string: string]: string}}
 */
const getRemapBentoNpmDependencies = once(() => getRemappings('npm'));

module.exports = {
  getRemapBentoDependencies,
  getRemapBentoNpmDependencies,
};
