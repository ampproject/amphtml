/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
const gulp = $$.help(require('gulp'));
const babel = require('gulp-babel');
const colors = require('ansi-colors');
const log = require('fancy-log');

/* Copy source to source-nomodule.js and
 * make it compatible with `<script type=module`.
 *
 * Finds and replaces regex changing `this` -> `self` in the snippet
 * inserted by closure compiler from
 * https://github.com/google/closure-compiler/blob/36f332788d54803c3c1afe06a9d84bf4b9f4945b/src/com/google/javascript/jscomp/js/util/global.js#L44
 * Read more here: http://exploringjs.com/es6/ch_modules.html#_browsers-scripts-versus-modules
 *
 *
 * Changes `global?global:VARNAME}(this)` to `global?global:VARNAME}(self)`
 */
exports.createModuleCompatibleBundle = function() {
  return new Promise(resolve => {
    const {green} = colors;
    log(green("Starting babel process, post closure compiler"));
    gulp.src('dist/**/*.js')
      .pipe($$.sourcemaps.init({loadMaps: true}))
      .pipe(babel({
        plugins: [require.resolve('../babel-plugins/babel-plugin-transform-module-compatible-global/index.js')]
      }))
      .pipe($$.sourcemaps.write('./'))
      .pipe(gulp.dest('dist-esm'))
      .on('end', resolve);
  })
};
