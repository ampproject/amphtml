const argv = require('minimist')(process.argv.slice(2));
const debounce = require('../common/debounce');
const {
  buildBentoExtensionJs,
  buildExtensionCss,
  buildNpmBinaries,
  buildNpmCss,
} = require('./extension-helpers');
const {endBuildStep, watchDebounceDelay} = require('./helpers');
const {log} = require('../common/logging');
const {red} = require('kleur/colors');
const {watch} = require('chokidar');
const {once} = require('../common/once');
const {bentoBundles, verifyBentoBundles} = require('../compile/bundles.config');

const bentoComponentsDir = 'src/bento/components';

const getComponentDir = (name, version) =>
  `${bentoComponentsDir}/${name}/${version}`;

/**
 * @type {{
 *   name: string,
 *   version: string,
 *   npm: ?boolean,
 * }}
 */
let BentoBundleDef;

/** @return {BentoBundleDef[]} */
const getBentoComponentsToBuild = once(() => {
  verifyBentoBundles();
  if (argv.noextensions) {
    return [];
  }
  // TODO(alanorozco): preBuild
  const {extensions} = argv;
  if (extensions) {
    if (typeof extensions !== 'string') {
      log(red('ERROR:'), '--extensions must be a comma-separated list');
      process.exit(1);
    }
    const names = new Set(extensions.split(','));
    return bentoBundles.filter(({name}) => names.has(name));
  }
  if (
    argv.extensions_from ||
    argv.bento_runtime_only ||
    argv.core_runtime_only
  ) {
    return [];
  }
  return bentoBundles;
});

/**
 * Watches for non-JS changes within an components directory to trigger
 * recompilation.
 *
 * @param {BentoBundleDef} component
 * @param {Object} options
 * @return {Promise<void>}
 */
async function watchBentoComponent(component, options) {
  /**
   * Steps to run when a watched file is modified.
   */
  function watchFunc() {
    buildBentoComponent(component, {
      ...options,
      continueOnError: true,
      isRebuild: true,
      watch: false,
    });
  }

  const dir = getComponentDir(component.name, component.version);
  const cssDeps = `${dir}/**/*.css`;
  const ignored = /dist/; //should not watch npm dist folders.
  watch([cssDeps], {ignored}).on(
    'change',
    debounce(watchFunc, watchDebounceDelay)
  );
}

/**
 * Copies components from
 * src/bento/components/$name/$name.js
 * to
 * dist/v0/$name-$version.js
 *
 * Optionally copies the CSS at components/$name/$version/$name.css into
 * a generated JS file that can be required from the components as
 * `import {CSS} from '../../../build/$name-0.1.css';`
 *
 * @param {BentoBundleDef} bundle
 * @param {?Object=} options
 * @return {!Promise<void>}
 */
async function buildBentoComponent(bundle, options = {}) {
  const {name, npm, version} = bundle;
  if (options.watch) {
    await watchBentoComponent(bundle, options);
  }
  const dir = `${bentoComponentsDir}/${name}/${version}`;
  const promises = [];
  promises.push(buildExtensionCss(dir, name, version, options));
  if (!options.compileOnlyCss) {
    if (npm) {
      // TODO(alanorozco): Change buildNpmBinaries to not require options.npm
      promises.push(buildNpmBinaries(dir, name, {...options, npm}));
      promises.push(buildNpmCss(dir, options));
    }
    if (!options.isRebuild) {
      promises.push(buildBentoExtensionJs(dir, name, options));
    }
  }
  await Promise.all(promises);
}

/**
 * Build all the Bento components
 *
 * @param {!Object} options
 * @return {!Promise<void>}
 */
async function buildBentoComponents(options) {
  const startTime = Date.now();
  const bundles = getBentoComponentsToBuild();
  const results = await Promise.all(
    bundles.map((bundle) => buildBentoComponent(bundle, options))
  );
  if (!options.compileOnlyCss && results.length > 0) {
    endBuildStep(
      options.minify ? 'Minified all' : 'Compiled all',
      'components',
      startTime
    );
  }
}

module.exports = {
  buildBentoComponents,
  buildBentoComponent,
  getBentoComponentsToBuild,
};
