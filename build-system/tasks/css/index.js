/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const debounce = require('debounce');
const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const {buildExtensions} = require('../extension-helpers');
const {endBuildStep, watchDebounceDelay} = require('../helpers');
const {jsifyCssAsync} = require('./jsify-css');
const {watch} = require('chokidar');

/**
 * Entry point for 'amp css'
 */
async function css() {
  await compileCss();
}

const cssEntryPoints = [
  {
    path: 'ampdoc.css',
    outJs: 'ampdoc.css.js',
    outCss: 'v0.css',
    append: false,
  },
  {
    path: 'ampshared.css',
    outJs: 'ampshared.css.js',
    outCss: 'v0.css',
    append: true,
  },
  {
    path: 'video-autoplay.css',
    outJs: 'video-autoplay.css.js',
    // When the .css.js files are imported, the .js extension is omitted
    // e.g. '../../build/file.css' attempts to load 'build/file.css.js'
    // but if a file which matches without the .js extension, it will
    // be preferred. We should rename the out.css to have a different name
    // than the JS file to avoid loading CSS as JS
    outCss: 'video-autoplay-out.css',
    append: false,
  },
  {
    path: 'amp-story-entry-point.css',
    outJs: 'amp-story-entry-point.css.js',
    outCss: 'amp-story-entry-point-v0.css',
    append: false,
  },
  {
    // Publisher imported CSS for `src/amp-story-player/amp-story-player.js`.
    path: 'amp-story-player.css',
    outJs: 'amp-story-player.css.js',
    outCss: 'amp-story-player-v0.css',
    append: false,
  },
  {
    // Internal CSS used for the iframes inside `src/amp-story-player/amp-story-player.js`.
    path: 'amp-story-player-iframe.css',
    outJs: 'amp-story-player-iframe.css.js',
    outCss: 'amp-story-player-iframe-v0.css',
    append: false,
  },
];

/**
 * Copies the css from the build folder to the dist folder
 */
async function copyCss() {
  const startTime = Date.now();
  await fs.ensureDir('dist/v0');
  for (const {outCss} of cssEntryPoints) {
    await fs.copy(`build/css/${outCss}`, `dist/${outCss}`);
  }
  const cssFiles = globby.sync('build/css/amp-*.css');
  await Promise.all(
    cssFiles.map((cssFile) => {
      return fs.copy(cssFile, `dist/v0/${path.basename(cssFile)}`);
    })
  );
  endBuildStep('Copied', 'build/css/*.css to dist/v0/*.css', startTime);
}

/**
 * Writes CSS to build folder
 *
 * @param {string} css
 * @param {string} jsFilename
 * @param {string} cssFilename
 * @param {boolean} append append CSS to existing file
 */
async function writeCss(css, jsFilename, cssFilename, append) {
  await fs.ensureDir('build/css');
  const jsContent = 'export const cssText = ' + JSON.stringify(css);
  await fs.writeFile(`build/${jsFilename}`, jsContent);
  if (append) {
    await fs.appendFile(`build/css/${cssFilename}`, css);
  } else {
    await fs.writeFile(`build/css/${cssFilename}`, css);
  }
}

/**
 * @param {string} path
 * @param {string} outJs
 * @param {string} outCss
 * @param {boolean} append
 */
async function writeCssEntryPoint(path, outJs, outCss, append) {
  const css = await jsifyCssAsync(`css/${path}`);
  await writeCss(css, outJs, outCss, append);
}

/**
 * Compile all the css and drop in the build folder
 *
 * @param {Object=} options
 * @return {!Promise}
 */
async function compileCss(options = {}) {
  if (options.watch) {
    watch('css/**/*.css').on(
      'change',
      debounce(compileCss, watchDebounceDelay)
    );
  }

  const startTime = Date.now();
  // Must be in order because some iterations write while others append.
  for (const {path, outJs, outCss, append} of cssEntryPoints) {
    await writeCssEntryPoint(path, outJs, outCss, append);
  }
  await buildExtensions({compileOnlyCss: true});
  endBuildStep('Recompiled all CSS files into', 'build/', startTime);
}

module.exports = {
  css,
  compileCss,
  copyCss,
  cssEntryPoints,
};

css.description = 'Recompile css to build directory';
