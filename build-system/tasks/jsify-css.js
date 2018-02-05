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


const autoprefixer = require('autoprefixer');
const colors = require('ansi-colors');
const cssnano = require('cssnano');
const fs = require('fs-extra');
const log = require('fancy-log');
const postcss = require('postcss');
const postcssImport = require('postcss-import');

// NOTE: see https://github.com/ai/browserslist#queries for `browsers` list
const cssprefixer = autoprefixer({
  browsers: [
    'last 5 ChromeAndroid versions',
    'last 5 iOS versions',
    'last 3 FirefoxAndroid versions',
    'last 5 Android versions',
    'last 2 ExplorerMobile versions',
    'last 2 OperaMobile versions',
    'last 2 OperaMini versions',
  ],
});

const cssNanoDefaultOptions = {
  autoprefixer: false,
  convertValues: false,
  discardUnused: false,
  cssDeclarationSorter: false,
  // `mergeIdents` this is only unsafe if you rely on those animation names in JavaScript.
  mergeIdents: true,
  reduceIdents: false,
  reduceInitial: false,
  zindex: false,
  svgo: {
    encode: true,
  },
};

/**
 * Css transformations to target file using postcss.

 * @param {string} filename css file
 * @param {!Object=} opt_cssnano cssnano options
 * @return {!Promise<string>} that resolves with the css content after
 *    processing
 */
const transformCss = exports.transformCss = function(filename, opt_cssnano) {
  opt_cssnano = opt_cssnano || Object.create(null);
  // See http://cssnano.co/optimisations/ for full list.
  // We try and turn off any optimization that is marked unsafe.
  const cssnanoOptions = Object.assign(Object.create(null),
      cssNanoDefaultOptions, opt_cssnano);
  const cssnanoTransformer = cssnano({preset: ['default', cssnanoOptions]});

  const css = fs.readFileSync(filename, 'utf8');
  const transformers = [postcssImport, cssprefixer, cssnanoTransformer];
  return postcss(transformers).process(css.toString(), {
    'from': filename,
  });
};

/**
 * 'Jsify' a CSS file - Adds vendor specific css prefixes to the css file,
 * compresses the file, removes the copyright comment, and adds the sourceURL
 * to the stylesheet
 *
 * @param {string} filename css file
 * @return {!Promise<string>} that resolves with the css content after
 *    processing
 */
exports.jsifyCssAsync = function(filename) {
  return transformCss(filename).then(function(result) {
    result.warnings().forEach(function(warn) {
      log(colors.red(warn.toString()));
    });
    const css = result.css;
    return css + '\n/*# sourceURL=/' + filename + '*/';
  });
};
