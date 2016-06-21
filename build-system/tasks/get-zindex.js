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


var fs = require('fs');
var gulp = require('gulp-help')(require('gulp'));
var postcss = require('postcss');
var table = require('text-table');
var through = require('through2');
var util = require('gulp-util');

var tableHeaders = [
 ['selector', 'z-index', 'file'],
 ['---', '---', '---'],
];

var tableOptions = {
  align: ['l', 'l', 'l'],
  hsep: '   |   ',
};


/**
 * @param {!Object<string, !Array<number>} acc accumulator object for selectors
 * @param {!Rules} css post css rules object
 */
function zIndexCollector(acc, css) {
  css.walkRules(rule => {
    rule.walkDecls(decl => {
      // Split out multi selector rules
      var selectorNames = rule.selector.replace('\n', '');
      selectorNames = selectorNames.split(',');
      if (decl.prop == 'z-index') {
        selectorNames.forEach(selector => {
          if (!acc[selector]) {
            acc[selector] = [];
          }
          acc[selector].push(decl.value);
        });
      }
    });
  });
}

/**
 * @param {!Object<string, !Object<string, !Array<number>} filesData
 *    accumulation of files and the rules and z index values.
 * @param {!Vinyl} file vinyl fs object
 * @param {string} enc encoding value
 * @param {function(err: ?Object, data: !Vinyl|string)} cb chunk data through
 */
function onFileThrough(filesData, file, enc, cb) {
  if (file.isNull()) {
    cb(null, file);
    return;
  }

  if (file.isStream()) {
    cb(new util.PluginError('size', 'Stream not supported'));
    return;
  }

  var selectors = filesData[file.relative] = Object.create(null);

  postcss([zIndexCollector.bind(null, selectors)])
      .process(file.contents.toString(), {
        from: file.relative
      }).then(res => {
        cb(null, file);
      });
}

/**
 * @param {!Object<string, !Object<string, !Array<number>} filesData
 *    accumulation of files and the rules and z index values.
 * @param {function()} cb callback to end the stream
 */
function onFileThroughEnd(filesData, cb) {
  var rows = [];
  rows.unshift.apply(rows, tableHeaders);
  Object.keys(filesData).sort().forEach((fileName, fileIdx) => {
    var selectors = filesData[fileName];
    Object.keys(selectors).sort().forEach((selectorName, selectorIdx) => {
      var zIndexes = selectors[selectorName];
      var row = [selectorName, zIndexes.join(', '), fileName];
      rows.push(row);
    });
  });
  var tbl = table(rows, tableOptions);
  fs.writeFileSync('css/Z_INDEX.md', tbl);
  cb();
}


/**
 * @return {!Stream}
 */
function getZindex() {
  var filesData = Object.create(null);
  return gulp.src('{css,src,extensions}/**/*.css').pipe(through.obj(
      onFileThrough.bind(null, filesData),
      onFileThroughEnd.bind(null, filesData)));
}


gulp.task('get-zindex', 'Runs through all css files of project to gather ' +
    'z-index values', getZindex);
