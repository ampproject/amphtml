'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {
  doBuild3pVendor,
  generateBundles,
} = require('../tasks/3p-vendor-helpers');
const {
  doBuildExtension,
  getExtensionsToBuild,
  maybeInitializeExtensions,
} = require('../tasks/extension-helpers');
const {compileCoreRuntime, doBuildJs} = require('../tasks/helpers');
const {jsBundles} = require('../compile/bundles.config');
const {VERSION} = require('../compile/internal-version');

const extensionBundles = {};
maybeInitializeExtensions(extensionBundles);

const vendorBundles = generateBundles();

/**
 * Gets the unminified name of the bundle if it can be lazily built.
 *
 * @param {!Object} bundles
 * @param {string} name
 * @return {string}
 */
function maybeGetUnminifiedName(bundles, name) {
  if (argv.minified) {
    for (const key of Object.keys(bundles)) {
      if (
        key == name ||
        (bundles[key].options && bundles[key].options.minifiedName == name)
      ) {
        return key;
      }
    }
  }
  return name;
}

/**
 * Checks for a previously triggered build for a bundle, and triggers one if
 * required.
 *
 * @param {string} url
 * @param {string|RegExp} matcher
 * @param {!Object} bundles
 * @param {function(!Object, string, ?Object):Promise} buildFunc
 * @param {function(): void} next
 * @return {Promise<void>}
 */
async function lazyBuild(url, matcher, bundles, buildFunc, next) {
  const match = url.match(matcher);
  if (match && match.length == 2) {
    const name = maybeGetUnminifiedName(bundles, match[1]);
    const bundle = bundles[name];
    if (bundle) {
      await build(bundles, name, buildFunc);
    }
  }
  next();
}

/**
 * Actually build a JS file or extension. Only will allow one build per
 * bundle at a time.
 *
 * @param {!Object} bundles
 * @param {string} name
 * @param {function(!Object, string, ?Object):Promise} buildFunc
 * @return {Promise<void>}
 */
async function build(bundles, name, buildFunc) {
  const bundle = bundles[name];
  if (bundle.pendingBuild) {
    return await bundle.pendingBuild;
  }
  if (bundle.watched) {
    return;
  }
  bundle.watched = true;
  bundle.pendingBuild = buildFunc(bundles, name, {
    watch: true,
    minify: argv.minified,
    localDev: true,
    onWatchBuild: async (bundlePromise) => {
      bundle.pendingBuild = bundlePromise;
      await bundlePromise;
      bundle.pendingBuild = undefined;
    },
  });
  await bundle.pendingBuild;
  bundle.pendingBuild = undefined;
}

/**
 * Lazy builds the correct version of an extension when requested.
 *
 * @param {!Object} req
 * @param {!Object} _res
 * @param {function(): void} next
 * @return {Promise<void>}
 */
async function lazyBuildExtensions(req, _res, next) {
  const matcher = argv.minified
    ? argv.esm
      ? /\/dist\/v0\/([^\/]*)\.mjs/ // '/dist/v0/*.mjs'
      : /\/dist\/v0\/([^\/]*)\.js/ // '/dist/v0/*.js'
    : /\/dist\/v0\/([^\/]*)\.max\.js/; // '/dist/v0/*.max.js'
  await lazyBuild(req.url, matcher, extensionBundles, doBuildExtension, next);
}

/**
 * Lazy builds a non-extension JS file when requested.
 *
 * @param {!Object} req
 * @param {!Object} _res
 * @param {function(): void} next
 * @return {Promise<void>}
 */
async function lazyBuildJs(req, _res, next) {
  const matcher = argv.esm ? /\/.*\/([^\/]*\.mjs)/ : /\/.*\/([^\/]*\.js)/;
  await lazyBuild(req.url, matcher, jsBundles, doBuildJs, next);
}

/**
 * Lazy builds a 3p iframe vendor file when requested.
 *
 * @param {!Object} req
 * @param {!Object} _res
 * @param {function(): void} next
 * @return {Promise<void>}
 */
async function lazyBuild3pVendor(req, _res, next) {
  const matcher = argv.minified
    ? argv.esm
      ? new RegExp(`\\/dist\\.3p\\/${VERSION}\\/vendor\\/([^\/]*)\\.mjs`) // '/dist.3p/21900000/vendor/*.mjs'
      : new RegExp(`\\/dist\\.3p\\/${VERSION}\\/vendor\\/([^\/]*)\\.js`) // '/dist.3p/21900000/vendor/*.js'
    : /\/dist\.3p\/current\/vendor\/([^\/]*)\.max\.js/; // '/dist.3p/current/vendor/*.max.js'
  await lazyBuild(req.url, matcher, vendorBundles, doBuild3pVendor, next);
}

/**
 * Pre-builds the core runtime and the JS files that it loads.
 * @return {Promise<void>}
 */
async function preBuildRuntimeFiles() {
  await build(jsBundles, 'amp.js', (_bundles, _name, options) =>
    compileCoreRuntime(options)
  );
}

/**
 * Pre-builds default extensions and ones requested via command line flags.
 * @return {Promise<void>}
 */
async function preBuildExtensions() {
  const extensions = getExtensionsToBuild(/* preBuild */ true);
  for (const extensionBundle in extensionBundles) {
    const extension = extensionBundles[extensionBundle].name;
    if (extensions.includes(extension) && !extensionBundle.endsWith('latest')) {
      await build(extensionBundles, extensionBundle, doBuildExtension);
    }
  }
}

module.exports = {
  lazyBuildExtensions,
  lazyBuildJs,
  lazyBuild3pVendor,
  preBuildExtensions,
  preBuildRuntimeFiles,
};
