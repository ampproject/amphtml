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


const $$ = require('gulp-load-plugins')();
const fs = require('fs-extra');
const gulp = $$.help(require('gulp'));
const {
  endBuildStep,
  mkdirSync,
  printNobuildHelp,
  toPromise,
} = require('./helpers');
const {buildExtensions, extensions} = require('./extension-helpers');
const {isTravisBuild} = require('../travis');
const {jsifyCssAsync} = require('./jsify-css');

const maybeUpdatePackages = isTravisBuild() ? [] : ['update-packages'];

/**
 * Entry point for 'gulp css'
 * @return {!Promise}
 */
function css() {
  printNobuildHelp();
  return compileCss();
}

const cssEntryPoints = [
  {
    path: 'amp.css',
    outJs: 'css.js',
    outCss: 'v0.css',
  },
  {
    path: 'video-autoplay.css',
    outJs: 'video-autoplay.css.js',
    outCss: 'video-autoplay.css',
  },
];

/**
 * Compile all the css and drop in the build folder
 * @param {boolean} watch
 * @param {boolean=} opt_compileAll
 * @return {!Promise}
 */
function compileCss(watch, opt_compileAll) {
  if (watch) {
    $$.watch('css/**/*.css', function() {
      compileCss();
    });
  }

  /**
   * Writes CSS to build folder
   *
   * @param {string} css
   * @param {string} originalCssFilename
   * @param {string} jsFilename
   * @param {string} cssFilename
   * @return {Promise}
   */
  function writeCss(css, originalCssFilename, jsFilename, cssFilename) {
    return toPromise(gulp.src(`css/${originalCssFilename}`)
        .pipe($$.file(jsFilename, 'export const cssText = ' +
          JSON.stringify(css)))
        .pipe(gulp.dest('build'))
        .on('end', function() {
          mkdirSync('build');
          mkdirSync('build/css');
          fs.writeFileSync(`build/css/${cssFilename}`, css);
        }));
  }

  /**
   * @param {string} path
   * @param {string} outJs
   * @param {string} outCss
   */
  function writeCssEntryPoint(path, outJs, outCss) {
    const startTime = Date.now();

    return jsifyCssAsync(`css/${path}`)
        .then(css => writeCss(css, path, outJs, outCss))
        .then(() => {
          endBuildStep('Recompiled CSS in', path, startTime);
        });
  }

  // Used by `gulp test --local-changes` to map CSS files to JS files.
  fs.writeFileSync('EXTENSIONS_CSS_MAP', JSON.stringify(extensions));


  let promise = Promise.resolve();

  cssEntryPoints.forEach(entryPoint => {
    const {path, outJs, outCss} = entryPoint;
    promise = promise.then(() => writeCssEntryPoint(path, outJs, outCss));
  });

  return promise.then(() => buildExtensions({
    bundleOnlyIfListedInFiles: false,
    compileOnlyCss: true,
    compileAll: opt_compileAll,
  }));
}

exports.compileCss = compileCss;
exports.cssEntryPoints = cssEntryPoints;

gulp.task('css', 'Recompile css to build directory', maybeUpdatePackages, css);
