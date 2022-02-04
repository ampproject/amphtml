'use strict';

const cssImports = require('css-imports');
const cssnano = require('cssnano');
const fs = require('fs-extra');
const path = require('path');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const {
  TransformCache,
  batchedRead,
  md5,
} = require('../../common/transform-cache');
const {log} = require('../../common/logging');
const {red} = require('kleur/colors');

// NOTE: see https://github.com/ai/browserslist#queries for `browsers` list
const browsersList = {
  overrideBrowserslist: [
    'last 5 ChromeAndroid versions',
    'last 5 iOS versions',
    'last 3 FirefoxAndroid versions',
    'last 5 Android versions',
    'last 2 ExplorerMobile versions',
    'last 2 OperaMobile versions',
    'last 2 OperaMini versions',
  ],
};

// See https://cssnano.co/docs/what-are-optimisations for full list.
// We try and turn off any optimization that is marked unsafe.
const cssNanoDefaultOptions = {
  autoprefixer: false,
  convertValues: false,
  discardUnused: false,
  cssDeclarationSorter: false,
  // `mergeIdents` this is only unsafe if you rely on those animation names in
  // JavaScript.
  mergeIdents: true,
  reduceIdents: false,
  reduceInitial: false,
  zindex: false,
  svgo: {
    encode: false,
  },
};

const packageJsonPath = path.join(__dirname, '..', '..', '..', 'package.json');

let environmentHash = null;

/** @return {Promise<string>} */
function getEnvironmentHash() {
  if (environmentHash) {
    return environmentHash;
  }

  // We want to set environmentHash to a promise synchronously s.t.
  // we never end up with multiple calculations at the same time.
  environmentHash = Promise.resolve().then(async () => {
    const packageJsonHash = md5(await fs.promises.readFile(packageJsonPath));
    const cssOptions = JSON.stringify({cssNanoDefaultOptions, browsersList});
    return md5(packageJsonHash, cssOptions);
  });
  return environmentHash;
}

/**
 * @typedef {{css: string, warnings: string[]}}:
 */
let CssTransformResultDef;

/**
 * Used to cache css transforms done by postcss.
 * @type {TransformCache<CssTransformResultDef>}
 */
let transformCache;

/**
 * Transform a css string using postcss.

 * @param {string} contents the css text to transform
 * @param {!Object=} opt_filename the filename of the file being transformed. Used for sourcemaps generation.
 * @return {!Promise<CssTransformResultDef>} that resolves with the css content after
 *    processing
 */
async function transformCssString(contents, opt_filename) {
  const hash = md5(contents);
  return transformCss(contents, hash, opt_filename);
}

/**
 * 'Jsify' a CSS file - Adds vendor specific css prefixes to the css file,
 * compresses the file, removes the copyright comment, and adds the sourceURL
 * to the stylesheet
 *
 * @param {string} filename css file
 * @return {!Promise<string>} that resolves with the css content after
 *    processing
 */
async function jsifyCssAsync(filename) {
  const {contents, hash: filehash} = await batchedRead(filename);
  const imports = await getCssImports(filename);
  const importHashes = await Promise.all(
    imports.map(async (importedFile) => (await batchedRead(importedFile)).hash)
  );
  const hash = md5(filehash, ...importHashes, await getEnvironmentHash());
  const result = await transformCss(contents, hash, filename);

  result.warnings.forEach((warn) => log(red(warn)));
  return result.css + '\n/*# sourceURL=/' + filename + '*/';
}

/**
 * Computes the transitive closure of CSS files imported by the given file.
 * @param {string} cssFile
 * @return {Promise<!Array<string>>}
 */
async function getCssImports(cssFile) {
  const contents = await fs.readFile(cssFile);
  const topLevelImports = cssImports(contents)
    .map((result) => result.path)
    .filter((importedFile) => !importedFile.startsWith('http'))
    .map((importedFile) => path.join(path.dirname(cssFile), importedFile));
  if (topLevelImports.length == 0) {
    return topLevelImports;
  }
  const nestedImports = await Promise.all(
    topLevelImports.map(async (file) => await getCssImports(file))
  );
  return topLevelImports.concat(nestedImports).flat();
}

/**
 * @param {string} contents
 * @param {string} hash
 * @param {string=} opt_filename
 * @return {Promise<CssTransformResultDef>}
 */
async function transformCss(contents, hash, opt_filename) {
  if (!transformCache) {
    transformCache = new TransformCache('.css-cache');
  }
  const cached = transformCache.get(hash);
  if (cached) {
    return cached;
  }

  const transformed = transform(contents, opt_filename);
  transformCache.set(hash, transformed);
  return transformed;
}

/**
 * @param {string} contents
 * @param {string=} opt_filename
 * @return {Promise<CssTransformResultDef>}
 */
async function transform(contents, opt_filename) {
  const cssnanoTransformer = cssnano({
    preset: ['default', cssNanoDefaultOptions],
  });
  const {default: autoprefixer} = await import('autoprefixer'); // Lazy-imported to speed up task loading.
  const cssprefixer = autoprefixer(browsersList);
  const transformers = [postcssImport, cssprefixer, cssnanoTransformer];
  return postcss
    .default(transformers)
    .process(contents, {'from': opt_filename})
    .then((result) => ({
      css: result.css,
      warnings: result.warnings().map((warning) => warning.toString()),
    }));
}

module.exports = {
  jsifyCssAsync,
  transformCssString,
};
