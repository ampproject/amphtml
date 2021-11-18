/**
 * @fileoverview
 * These are the packages, and their exports that are included in `bento.js`
 * Extension `bento-*.js` binaries will use these exports as provided by
 * `bento.js` from the `BENTO` global.
 *
 * We specify each export explicitly by name.
 * Unlisted imports will be bundled with each binary.
 */

const types = require('@babel/types');
const {parse} = require('@babel/parser');
const {readFileSync} = require('fs-extra');
const {relative} = require('path');

const packages = [
  'preact',
  'preact/slot',
  'core/context',
  'core/context/values',
  // TODO:
  'preact/component',
  // 'preact/component/contain',
  // 'preact/component/wrapper',
  'preact/compat',
  'preact/base-element',
  'preact/context',
];

/**
 * @param {string} source
 * @return {string[]}
 */
function getExportedSymbols(source) {
  const tree = parse(source, {sourceType: 'module', plugins: ['jsx']});
  const symbols = [];
  types.traverseFast(tree, (node) => {
    if (types.isExportAllDeclaration(node)) {
      throw new Error('Should not "export *"');
    }
    if (types.isExportNamedDeclaration(node)) {
      symbols.push(
        // @ts-ignore
        ...(node.declaration?.declarations?.map(({id}) => id.name) ?? [])
      );
      // @ts-ignore
      symbols.push(node.declaration?.id?.name);
      symbols.push(
        ...node.specifiers.map((node) => {
          if (types.isExportDefaultSpecifier(node)) {
            throw new Error('Should not export from a default import');
          }
          if (types.isExportNamespaceSpecifier(node)) {
            throw new Error('Should not export a namespace');
          }
          const {exported, local} = node;
          if (types.isStringLiteral(exported)) {
            throw new Error('Should not export symbol as string');
          }
          if (local.name !== exported.name) {
            throw new Error(
              `Exported name "${exported.name}" should match local name "${local.name}"`
            );
          }
          return exported.name;
        })
      );
    }
  });
  return symbols;
}

let sharedBentoSymbols;

/**
 * @return {Object<string, string[]>}
 */
function getSharedBentoSymbols() {
  if (!sharedBentoSymbols) {
    const backToRoot = relative(__dirname, process.cwd());
    const entries = packages.map((pkg) => {
      const filepath = require.resolve(`${backToRoot}/src/${pkg}`);
      try {
        const source = readFileSync(filepath, 'utf8');
        const symbols = getExportedSymbols(source);
        return [`#${pkg}`, symbols.filter(Boolean)];
      } catch (e) {
        e.message = `${filepath}: ${e.message}`;
        throw e;
      }
    });
    sharedBentoSymbols = Object.fromEntries(entries);
  }
  return sharedBentoSymbols;
}

module.exports = {getSharedBentoSymbols};
