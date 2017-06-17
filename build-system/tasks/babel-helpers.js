/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview gulp task that generates a lightweight version of
 * babel helpers based on the features we actually use in the source code.
 */

var babel = require('babel-core');
var fs = require('fs');
var gulp = require('gulp-help')(require('gulp'));
var through = require('through2');
var util = require('gulp-util');

var options = JSON.parse(fs.readFileSync('.babelrc', 'utf8').toString());


/**
 * @param {!Array<!Array<string>>} helpers
 * @param {!File} file vinyl object.
 * @param {string} enc
 * @param {function} cb
 */
function onFileThrough(helpers, file, enc, cb) {
  if (file.isNull()) {
    cb(null, file);
    return;
  }

  if (file.isStream()) {
    cb(new util.PluginError('babel-helpers', 'Stream not supported'));
    return;
  }

  var usedHelpers = babel.transform(file.contents, options)
      .metadata.usedHelpers;
  helpers.push(usedHelpers);
  cb(null, file);
}

/**
 * @param {!Array<!Array<string>>} usedHelpers
 * @param {function} cb
 */
function onFileThroughEnd(usedHelpers, cb) {
  var helpers = [].concat.apply([], usedHelpers);
  var content = babel.buildExternalHelpers(helpers);
  fs.writeFileSync('third_party/babel/custom-babel-helpers.js', content +'\n');
  cb();
}

/**
 * @return {!Stream}
 */
function babelHelpers() {
  var helpers = [];
  return through.obj(
      onFileThrough.bind(null, helpers),
      onFileThroughEnd.bind(null, helpers)
  );
}

/**
 * @return {!Stream}
 */
function buildBabelHelpers(cb) {
  return gulp.src('./{src,3p,extensions,builtins}/**/*.js')
      .pipe(babelHelpers());
}

gulp.task('babel-helpers', 'Builds custom-babel-helpers.js',
    buildBabelHelpers);
