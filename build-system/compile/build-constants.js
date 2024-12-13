const argv = require('minimist')(process.argv.slice(2));
const {VERSION} = require('./internal-version');

const testTasks = [
  'e2e',
  'integration',
  'visual-diff',
  'unit',
  'check-types',
  'babel-plugin-tests',
];
const isTestTask = testTasks.some((task) => argv._.includes(task));
const isProd = argv._.includes('dist') && !argv.fortesting;
const isMinified = argv._.includes('dist') || !!argv.minified;

/**
 * Build time constants. Used by babel but hopefully one day directly by the bundlers..
 *
 * TODO: move constant replacement to bundlers once either https://github.com/google/closure-compiler/issues/1601
 *       is resolved, or we switch to using a different bundler.
 *
 * @type {{[key: string]: boolean|string}}
 */
const BUILD_CONSTANTS = {
  IS_PROD: isProd,
  IS_MINIFIED: isMinified,
  INTERNAL_RUNTIME_VERSION: isTestTask ? '$internalRuntimeVersion$' : VERSION,

  // We build on the idea that SxG is an upgrade to the ESM build.
  // Therefore, all conditions set by ESM will also hold for SxG.
  // However, we will also need to introduce a separate IS_SxG flag
  // for conditions only true for SxG.
  IS_ESM: !!(argv.esm || argv.sxg),
  IS_SXG: !!argv.sxg,
  // IS_SSR is always false by default and can only be overriden on a per
  // output file basis in bundles.config.extensions through `options.ssr`.
  IS_SSR_CSS: false,
};

module.exports = {BUILD_CONSTANTS};
