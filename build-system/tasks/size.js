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

var table = require('text-table');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var gzipSize = require('gzip-size');
var prettyBytes = require('pretty-bytes');
var through = require('through2');


var tempFolderName = '__size-temp';

var tableHeaders = [['size', 'gzip', 'file'], ['---', '---', '---']];

var tableOptions = {
  align: ['r', 'r', 'l'],
  hsep: '   |   ',
};

function onFileThrough(rows, file, enc, cb) {
  if (file.isNull()) {
    cb(null, file);
    return;
  }

  if (file.isStream()) {
    callback(new gutil.PluginError('size-task', 'Stream not supported'));
    return;
  }

  rows.push([
    prettyBytes(file.contents.length),
    prettyBytes(gzipSize.sync(file.contents)),
    file.relative,
  ]);

  cb(null, file);
}

function onFileThroughEnd(rows , cb) {
  rows.unshift.apply(rows, tableHeaders);
  var tbl = table(rows, tableOptions);
  console/*OK*/.log(tbl);
  fs.writeFileSync('test/size.txt', tbl);
  cb();
}

function sizer() {
  var rows = [];
  return through.obj(
      onFileThrough.bind(null, rows),
      onFileThroughEnd.bind(null, rows)
  );
}

function sizeTask() {
  gulp.src(['dist/**/*.js', 'dist.3p/{current,current-min}/**/*.js'])
    .pipe(sizer())
    .pipe(gulp.dest(tempFolderName))
    .on('end', del.bind(null, [tempFolderName]));
}

gulp.task('size', sizeTask);
