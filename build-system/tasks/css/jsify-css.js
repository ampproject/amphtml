/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const cssnano = require('cssnano');
const fs = require('fs');
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
    encode: true,
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
 * Used to cache css transforms done by postcss.
 * @const {TransformCache}
 */
let transformCache;

/**
 * @typedef {{css: string, warnings: string[]}}:
 */
let CssTransformResultDef;

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
  const hash = md5(filehash, await getEnvironmentHash());
  const result = await transformCss(contents, hash, filename);

  result.warnings.forEach((warn) => log(red(warn)));
  return result.css + '\n/*# sourceURL=/' + filename + '*/';
}

/**
 * @param {string} contents
 * @param {string} hash
 * @param {string=} opt_filename
 * @return {Promise<CssTransformResultDef>}
 */
async function transformCss(contents, hash, opt_filename) {
  if (!transformCache) {
    transformCache = new TransformCache('.css-cache', '.css');
  }
  const cached = transformCache.get(hash);
  if (cached) {
    return JSON.parse((await cached).toString());
  }

  const transformed = transform(contents, opt_filename);
  await transformCache.set(
    hash,
    transformed.then((r) => JSON.stringify(r))
  );
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
