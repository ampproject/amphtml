/**
 * @fileoverview
 * Compile-time generators of entry-points for Bento-related binaries.
 */

// TODO(alanorozco): Move generators of extension-related `defineElement()`
// into this file. Add tests for them, now that we have tests here.

const bentoRuntimePackages = require('./metadata/bento-runtime-packages');
const dedent = require('dedent');

/**
 * @param {Object<string, string[]>} packages
 * @return {string}
 */
function generateBentoRuntime(packages = bentoRuntimePackages) {
  return dedent(`
    import {dict} from '#core/types/object';
    import {isEsm} from '#core/mode';
    import {install as installCustomElements} from '#polyfills/custom-elements';

    ${Object.entries(packages)
      .map(([pkg, names]) => `import {${names.join(', ')}} from '${pkg}';`)
      .join('\n')}

    if (!isEsm()) {
      installCustomElements(self, class {});
    }

    const bento = self.BENTO || [];

    bento['_'] = dict({
    ${getNamesNoDupes(packages)
      .map((name) => `'${name}': ${name},`)
      .join('\n')}
    });

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
 * @param {Object<string, string[]>} packages
 * @return {string}
 */
function generateIntermediatePackage(packages = bentoRuntimePackages) {
  return [
    "const _ = (name) => self.BENTO['_'][name];",
    ...getNamesNoDupes(packages).map(
      (name) => `export const ${name} = /*#__PURE__*/ _('${name}');`
    ),
  ].join('\n');
}

/**
 * @param {Object<string, string[]>} packages
 * @return {string[]}
 */
function getNamesNoDupes(packages = bentoRuntimePackages) {
  const names = Object.values(packages).flat();
  if (Array.from(new Set(names)).length !== names.length) {
    throw new Error(
      'bento-runtime-packages should not contain duplicate leaf names'
    );
  }
  return names;
}

module.exports = {
  generateBentoRuntime,
  generateIntermediatePackage,
};
