/**
 * @fileoverview
 * Compile-time generators of entry-points for Bento-related binaries.
 */

// TODO(alanorozco): Move generators of extension-related `defineElement()`
// into this file. Add tests for them, now that we have tests here.

const dedent = require('dedent');
const {getSharedBentoSymbols} = require('./shared-bento-symbols');

/**
 * @param {Object<string, string[]>} [packageSymbols]
 * @return {string}
 */
function generateBentoRuntimeEntrypoint(packageSymbols) {
  packageSymbols = packageSymbols || getSharedBentoSymbols();

  assertNoDupes(Object.values(packageSymbols).flat());
  return dedent(`
    import {isEsm} from '#core/mode';
    import {install as installCustomElements} from '#polyfills/custom-elements';

    ${generateEsImportExports(packageSymbols)}

    if (!isEsm()) {
      installCustomElements(self, class {});
    }

    const bento = self.BENTO || [];

    bento['_'] = {
    ${Object.entries(packageSymbols)
      .map(([name, symbols]) => [
        `// ${name}`,
        ...symbols.map((symbol) => `'${symbol}': ${symbol},`),
      ])
      .flat()
      .join('\n')}
    };

    bento.push = (fn) => {
      fn();
    };

    self.BENTO = bento;

    for (const fn of bento) {
      bento.push(fn);
    }
  `);
}

/**
 * @param {Object<string, string[]>} [packageSymbols]
 * @return {string}
 */
function generateBentoCoreEntrypoint(packageSymbols) {
  packageSymbols = packageSymbols || getSharedBentoSymbols();

  assertNoDupes(Object.values(packageSymbols).flat());
  return dedent(`
    ${generateEsImportExports(packageSymbols, true)}
  `);
}

/**
 *
 * @param {Object<string, string[]>} packageSymbols
 * @param {boolean} generateExport
 * @return {string}
 */
function generateEsImportExports(packageSymbols, generateExport = false) {
  const esImportOrExportStatement = generateExport ? 'export' : 'import';
  return Object.entries(packageSymbols)
    .map(
      ([name, symbols]) =>
        `${esImportOrExportStatement} {${symbols.join(', ')}} from '${name}';`
    )
    .join('\n');
}

/**
 * @param {Object<string, string[]>} packageSymbols
 * @return {string}
 */
function generateIntermediatePackage(packageSymbols = getSharedBentoSymbols()) {
  assertNoDupes(Object.values(packageSymbols).flat());
  return [
    "const _ = (name) => self.BENTO['_'][name];",
    ...Object.entries(packageSymbols).map(([name, symbols]) => [
      `// ${name}`,
      ...symbols.map(
        (symbol) => `export const ${symbol} = /*#__PURE__*/ _('${symbol}');`
      ),
    ]),
  ]
    .flat()
    .join('\n');
}

/**
 * @param {string[]} symbols
 */
function assertNoDupes(symbols) {
  if (Array.from(new Set(symbols)).length !== symbols.length) {
    throw new Error(
      'Shred symbols should not duplicate names, even if they come from different packages.'
    );
  }
}

module.exports = {
  generateBentoRuntimeEntrypoint,
  generateIntermediatePackage,
  generateBentoCoreEntrypoint,
};
