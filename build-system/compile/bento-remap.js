const types = require('@babel/types');
const {parse} = require('@babel/parser');
const {getRelativeAliasMap} = require('../babel-config/import-resolver');
const path = require('path');
const {readFileSync} = require('fs-extra');

/**
 * @param {string} source
 * @return {string[]}
 */
function getExportAllPackages(source) {
  const tree = parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'exportDefaultFrom'],
  });
  const packages = [];
  for (const node of tree.program.body) {
    if (types.isExportAllDeclaration(node)) {
      packages.push(node.source.value);
    } else if (types.isExportDefaultDeclaration(node)) {
      throw new Error('Should not "export default"');
    } else if (types.isExportNamedDeclaration(node)) {
      throw new Error('Should not export named symbol');
    }
  }
  return packages;
}

/**
 * @param {string} from
 * @param {string} to
 * @return {{[string: string]: string}}
 */
function getRemapExportAllDependencies(from, to) {
  const aliasMap = getRelativeAliasMap('.');
  const aliasReplacements = Object.entries(aliasMap).map(([alias, path]) => {
    const regexp = new RegExp(`^${alias.replace('/', '\\/')}(\/|$)`);
    return [regexp, path];
  });
  const modules = getExportAllPackages(readFileSync(from, 'utf8'));
  return Object.fromEntries(
    modules.map((name) => {
      for (const [regexp, path] of aliasReplacements) {
        name = name.replace(regexp, `${path}$1`);
      }
      return [path.posix.join(process.cwd(), name), to];
    })
  );
}

let remapBentoExtensionDependencies;

/**
 * Remaps imports from source to externals.
 * @return {{[string: string]: string}}
 */
function getRemapBentoDependencies() {
  if (!remapBentoExtensionDependencies) {
    remapBentoExtensionDependencies = {
      ...getRemapExportAllDependencies('src/bento.js', './dist/bento.mjs'),
    };
  }
  return remapBentoExtensionDependencies;
}

module.exports = {
  getRemapBentoDependencies,
};
