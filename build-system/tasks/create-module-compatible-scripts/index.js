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

/**
 * Takes the file given by gulp and parses its ast to find ternary condition,
 * returning either `window.global` or `this`.
 * In order to make the script compatible with `<script type=module`
 * we replace the `this` found in the condition with `self`.
 * @param {Buffer|string} file
 * @param {string=} encoding
 * @param {function(Error, Object)} callback - Call this function (optionally with an
 * error argument and data) when you are done processing the supplied chunk.
 */
function transform(file, encoding, callback) {
  const code = file.contents.toString('utf8');
  const ast = parser.parse(code);
  const magicString = new MagicString(code);
  const changes = [];

  traverse(ast, {
    enter(path) {
      // Find the closest encosing function that is not an arrow.
      // Arrows inherit their parent's `this` context.
      let parent = path;
      const {node} = path;
      if (node.type === 'ThisExpression') {
        while ((parent = parent.getFunctionParent())) {
          if (parent.isFunction() && !parent.isArrowFunctionExpression()) {
            return;
          }
        }
        // collect the changes in an array
        changes.push({
          start: node.start,
          end: node.end,
          value: 'self',
        });
        return;
      }
    },
  });

  // Apply the collected changes.
  changes.forEach(change => {
    magicString.overwrite(change.start, change.end, change.value);
  });

  file.contents = new Buffer(magicString.toString());
  callback(null, file);
}

/**
 * Enables the `.pipe` functionality for the gulp process.
 */
function transformTopLevelGlobalScope() {
  return through.obj(transform);
}

/**
 * Finds and replaces `window.global:this` in the script
 * inserted by closure compiler from
 * https://github.com/google/closure-compiler/blob/36f332788d54803c3c1afe06a9d84bf4b9f4945b/src/com/google/javascript/jscomp/js/util/global.js#L44
 * Read more here: http://exploringjs.com/es6/ch_modules.html#_browsers-scripts-versus-modules
 * @param {Object} srcGlob
 * @param {string} destFolder
 */
exports.createModuleCompatibleBundle = function(srcGlob, destFolder) {
  return new Promise(resolve => {
    const {green} = colors;
    log(green(
        'Starting post closure compiler transform to make scripts module safe.'
    ));
    gulp.src(srcGlob)
        .pipe($$.sourcemaps.init({loadMaps: true}))
        .pipe(transformTopLevelGlobalScope())
        .pipe($$.sourcemaps.write('./'))
        .pipe(gulp.dest(destFolder))
        .on('end', resolve);
  });
};

exports.transform = transform;
