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
const colors = require('ansi-colors');
const gulp = $$.help(require('gulp'));
const log = require('fancy-log');
const MagicString = require('magic-string');
const parser = require('@babel/parser');
const through = require('through2');
const traverse = require('@babel/traverse').default;

function transformTopLevelGlobalScope() {
  function transform(file, encoding, callback) {
    const code = file.contents.toString('utf8');
    const ast = parser.parse(code);
    const magicString = new MagicString(code);

    traverse(ast, {
      enter(path) {
        if (path.node.type !== 'ConditionalExpression')
        {return;}
        const {node} = path;
        const {consequent, alternate} = node;
        if (consequent.type !== 'MemberExpression') {return;}
        if (alternate.type !== 'ThisExpression') {return;}
        const {object, property} = consequent;
        if (object.name !== 'window' && property.name !== 'global') {return;}
        magicString.overwrite(alternate.start, alternate.end, 'self');
      },
    });
    file.contents = new Buffer(magicString.toString());
    callback(null, file);
  }

  return through.obj(transform);
}

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
exports.createModuleCompatibleBundle = function(srcGlob) {
  return new Promise(resolve => {
    const {green} = colors;
    log(green('Starting babel process, post closure compiler'));
    gulp.src(srcGlob)
        .pipe($$.sourcemaps.init({loadMaps: true}))
        .pipe(transformTopLevelGlobalScope())
        .pipe($$.sourcemaps.write('./'))
        .pipe(gulp.dest('dist'))
        .on('end', resolve);
  });
};
