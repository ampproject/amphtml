const argv = require('minimist')(process.argv.slice(2));
const debounce = require('../common/debounce');
const {
  buildBentoExtensionJs,
  buildBinaries,
  buildExtensionCss,
  buildNpmBinaries,
  buildNpmCss,
  declareExtension,
  getExtensionsFromArg,
} = require('./extension-helpers');
const {bentoBundles, verifyBentoBundles} = require('../compile/bundles.config');
const {endBuildStep, watchDebounceDelay} = require('./helpers');
const {log} = require('../common/logging');
const {mkdir} = require('fs-extra');
const {red} = require('kleur/colors');
const {watch} = require('chokidar');

// All declared components.
const COMPONENTS = {};

/**
 * Initializes all components from build-system/compile/bundles.config.bento.json
 * if not already done and populates the given components object.
 * @param {Object} componentsObject
 */
function maybeInitializeBentoComponents(componentsObject) {
  if (Object.keys(componentsObject).length > 0) {
    return;
  }
  verifyBentoBundles();
  bentoBundles.forEach((c) => {
    declareExtension(c.name, c.version, c.options, componentsObject);
  });
}

/**
 * Process the command line arguments --noextensions, --components, and
 * --extensions_from and return a list of the referenced components.
 *
 * @param {boolean} preBuild Used for lazy building of components.
 * @return {!Array<string>}
 */
function getBentoComponentsToBuild(preBuild = false) {
  const componentsToBuild = new Set();
  if (argv.extensions) {
    if (typeof argv.extensions !== 'string') {
      log(red('ERROR:'), 'Missing list of components.');
      process.exit(1);
    }
    const explicitComponents = argv.extensions.replace(/\s/g, '').split(',');
    explicitComponents.forEach((component) => componentsToBuild.add(component));
  }
  if (argv.extensions_from) {
    const componentsFrom = getExtensionsFromArg(argv.extensions_from);
    componentsFrom.forEach((component) => componentsToBuild.add(component));
  }
  if (
    !preBuild &&
    !argv.noextensions &&
    !argv.extensions &&
    !argv.extensions_from &&
    !argv.core_runtime_only
  ) {
    const allComponents = Object.values(COMPONENTS).map((c) => c.name);
    allComponents.forEach((component) => componentsToBuild.add(component));
  }
  return Array.from(componentsToBuild);
}

/**
 * Watches for non-JS changes within an components directory to trigger
 * recompilation.
 *
 * @param {string} componentsDir
 * @param {string} name
 * @param {string} version
 * @param {boolean} hasCss
 * @param {?Object} options
 * @return {Promise<void>}
 */
async function watchBentoComponent(
  componentsDir,
  name,
  version,
  hasCss,
  options
) {
  /**
   * Steps to run when a watched file is modified.
   */
  function watchFunc() {
    buildBentoComponent(name, version, hasCss, {
      ...options,
      continueOnError: true,
      isRebuild: true,
      watch: false,
    });
  }

  const cssDeps = `${componentsDir}/**/*.css`;
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
 * @param {string} name Name of the extension. Must be the sub directory in
 *     the components directory and the name of the JS and optional CSS file.
 * @param {string} version Version of the extension. Must be identical to
 *     the sub directory inside the extension directory
 * @param {boolean} hasCss Whether there is a CSS file for this extension.
 * @param {?Object} options
 * @return {!Promise<void|void[]>}
 */
async function buildBentoComponent(name, version, hasCss, options = {}) {
  options.npm = true;
  options.bento = true;

  if (options.compileOnlyCss && !hasCss) {
    return;
  }
  const componentsDir = `src/bento/components/${name}/${version}`;
  await mkdir(`${componentsDir}/dist`, {recursive: true});
  if (options.watch) {
    watchBentoComponent(componentsDir, name, version, hasCss, options);
  }

  /** @type {Promise<void>[]} */
  const promises = [];
  if (hasCss) {
    await mkdir('build/css', {recursive: true});
    promises.push(buildExtensionCss(componentsDir, name, version, options));
    if (options.compileOnlyCss) {
      return Promise.all(promises);
    }
  }
  promises.push(buildNpmBinaries(componentsDir, name, options));
  promises.push(buildNpmCss(componentsDir, options));
  if (options.binaries) {
    promises.push(buildBinaries(componentsDir, options.binaries, options));
  }
  if (options.isRebuild) {
    return Promise.all(promises);
  }

  promises.push(buildBentoExtensionJs(componentsDir, name, options));
  return Promise.all(promises);
}

/**
 * Build all the Bento components
 *
 * @param {!Object} options
 * @return {!Promise<void>}
 */
async function buildBentoComponents(options) {
  const startTime = Date.now();
  maybeInitializeBentoComponents(COMPONENTS);
  const toBuild = getBentoComponentsToBuild();
  const results = Object.values(COMPONENTS)
    .filter(
      (component) => options.compileOnlyCss || toBuild.includes(component.name)
    )
    .map((component) =>
      buildBentoComponent(component.name, component.version, component.hasCss, {
        ...options,
        ...component,
      })
    );

  await Promise.all(results);
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
  buildComponent: buildBentoComponent,
  getBentoComponentsToBuild,
  maybeInitializeBentoComponents,
};
