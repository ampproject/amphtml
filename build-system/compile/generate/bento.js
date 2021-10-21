/**
 * @fileoverview
 * Compile-time generators of entry-points for Bento-related binaries.
 */

// TODO(alanorozco): Move generators of extension-related `defineElement()`
// into this file. Add tests for them, now that we have tests here.

const bentoRuntimePackages = require('./metadata/bento-runtime-packages');
const dedent = require('dedent');

const getPackageImportId = (pkg, name) =>
  `${pkg}_${name}`.replace(/[^a-z0-9]/gi, '_');

/**
 * @param {Object<string, string[]>} packages
 * @return {string}
 */
function generateBentoRuntime(packages = bentoRuntimePackages) {
  const packagesEntries = Object.entries(packages);
  const imports = packagesEntries.map(([pkg, names]) => {
    const specifiers = names.map((name) => {
      const id = getPackageImportId(pkg, name);
      return `${name} as ${id},`;
    });
    return [`import {`, ...specifiers, `} from '${pkg}'`].join('\n');
  });
  const globals = packagesEntries.map(([pkg, names]) => {
    const properties = names.map((name) => {
      const id = getPackageImportId(pkg, name);
      return `'${name}': ${id},`;
    });
    return [`bento['${pkg}'] = dict({`, ...properties, `})`].join('\n');
  });
  return dedent(`
    import {dict} from '#core/types/object';
    import {install as installCustomElements} from '#polyfills/custom-elements.js';
    
    ${imports.join(';\n\n')};

    installCustomElements(self);

    const bento = self.BENTO || [];

    ${globals.join(';\n\n')};

    bento.push = (fn) => {
      fn();
    };

    self.BENTO = bento;

    for (const fn of bento) {
      bento.push(fn);
    }
  `);
}

module.exports = {
  generateBentoRuntime,
};
