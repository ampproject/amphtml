const babelTypes = require('@babel/types');
const {parse} = require('@babel/parser');
const {resolvePath} = require('../babel-config/import-resolver');
const path = require('path');
const {readFileSync} = require('fs-extra');
const {once} = require('../common/once');
const {bentoBundles} = require('./bundles.config');

/**
 * @param {string} name
 * @return {string}
 */
function resolvePathAbsolute(name) {
  const resolved = resolvePath(name);
  return path.posix.join(process.cwd(), resolved);
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
function getAllRemappings() {
  // IMPORTANT: cdn mappings must start with ./dist/
  // TODO(keshavvi): Add npm mappings

  // Determine modules to import from shared bento.mjs.
  const coreBentoModules = getExportAll('src/bento/bento.js');
  const coreBentoRemappings = coreBentoModules.map((source) => ({
    source,
    cdn: '../bento.mjs',
  }));

  // Allow component cross-dependency
  const componentRemappings = bentoBundles.map(({name, version}) => ({
    source: `./src/bento/components/${name}/${version}/${name}`,
    cdn: `./${name}-${version}.mjs`,
  }));

  return [...coreBentoRemappings, ...componentRemappings]
    .map(({source, ...rest}) => {
      // esbuild wants absolute paths
      const absolute = resolvePathAbsolute(source);
      return [
        {source: absolute, ...rest},
        // When an index.js file is present, esbuild will remap to the directory
        // with a trailing slash. We add another entry to match these cases.
        {source: `${absolute}/`, ...rest},
      ];
    })
    .flat();
}

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
 * @return {{[string: string]: string}}
 */
const getRemapBentoDependencies = once(() => getRemappings('cdn'));

module.exports = {
  getRemapBentoDependencies,
};
