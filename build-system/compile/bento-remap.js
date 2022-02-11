const babelTypes = require('@babel/types');
const {parse} = require('@babel/parser');
const {resolvePath} = require('../babel-config/import-resolver');
const {lstatSync, readFileSync} = require('fs-extra');
const {once} = require('../common/once');
const {bentoBundles} = require('./bundles.config');
const {getNameWithoutComponentPrefix} = require('../tasks/bento-helpers');
const {findJsSourceFilename} = require('../common/fs');

/**
 * @param {string} path
 * @return {Promise<string|undefined>}
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
  return findJsSourceFilename(unaliased);
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

/** @return {Promise<MappingEntryDef[]>}}} */
const getAllRemappings = once(async () => {
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
    (
      await Promise.all(
        [...coreBentoRemappings, ...componentRemappings].map(
          resolveMappingEntry
        )
      )
    ).filter(Boolean)
  );
});

/**
 * @param {MappingEntryDef} mapping
 * @return {Promise<MappingEntryDef|undefined>}
 */
async function resolveMappingEntry({cdn, npm, source}) {
  const resolved = await resolveExactModuleFile(source);
  if (resolved) {
    return {source: resolved, cdn, npm};
  }
}

/**
 * @param {'npm'|'cdn'} type
 * @return {Promise<{[string: string]: string}>}
 */
async function getRemappings(type) {
  return /** @type {{[string: string]: string}} */ (
    Object.fromEntries(
      (await getAllRemappings())
        .filter((mapping) => mapping[type])
        .map((mapping) => [mapping.source, mapping[type]])
    )
  );
}

/**
 * Remaps imports from source to externals.
 * @param {string} isMinified
 * @return {Promise<{[string: string]: string}>}
 */
async function getRemapBentoDependencies(isMinified) {
  const remappings = await getRemappings('cdn');
  if (isMinified) {
    return remappings;
  }
  return Object.fromEntries(
    Object.entries(remappings).map(([source, cdn]) => [
      source,
      cdn.replace('.mjs', '.max.mjs'),
    ])
  );
}

/**
 * Remaps imports from source to externals.
 * @return {Promise<{[string: string]: string}>}
 */
function getRemapBentoNpmDependencies() {
  return getRemappings('npm');
}

module.exports = {
  getRemapBentoDependencies,
  getRemapBentoNpmDependencies,
};
