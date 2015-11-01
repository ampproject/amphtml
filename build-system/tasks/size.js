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

var del = require('del');
var fs = require('fs');
var gulp = require('gulp-help')(require('gulp'));
var gutil = require('gulp-util');
var gzipSize = require('gzip-size');
var prettyBytes = require('pretty-bytes');
var runSequence = require('run-sequence');
var sortedObject = require('sorted-object');
var through = require('through2');


var tempFolderName = '__size-temp';


/**
 * Through2 transform function - Tracks the original size and the gzipped size
 * of the file content in the rows array. Passes the file and/or err to the
 * callback when finished.
 * @param {!Object} files
 * @param {!Object} gzipFiles
 * @param {!File} file File to process
 * @param {string} enc Encoding (not used)
 * @param {function(?Error, !File)} cb Callback function
 */
function onFileThrough(files, gzipFiles, file, enc, cb) {
  if (file.isNull()) {
    cb(null, file);
    return;
  }

  if (file.isStream()) {
    cb(new gutil.PluginError('size-task', 'Stream not supported'));
    return;
  }

  files[file.relative] = prettyBytes(file.contents.length);
  gzipFiles[file.relative] = prettyBytes(gzipSize.sync(file.contents));

  cb(null, file);
}

/**
 * Through2 flush function - write the json files to disk.
 * @param {!Object} files
 * @param {!Object} gzipFiles
 * @param {function()} cb Callback function
 */
function onFileThroughEnd(files, gzipFiles, cb) {
  files = sortedObject(files);
  gzipFiles = sortedObject(gzipFiles);
  var jsonUnmin = JSON.stringify(files, null, 2);
  var jsonMin = JSON.stringify(gzipFiles, null, 2);
  fs.writeFileSync('test/sizes.json', jsonUnmin + '\n');
  fs.writeFileSync('test/sizes.gzip.json', jsonMin + '\n');
  cb();
}

/**
 * Setup through2 to capture size information using the above transform and
 * flush functions on a stream
 * @return {!Stream} a Writable Stream
 */
function sizer() {
  var files = Object.create(null);
  var gzipFiles = Object.create(null);
  return through.obj(
      onFileThrough.bind(null, files, gzipFiles),
      onFileThroughEnd.bind(null, files, gzipFiles)
  );
}

/**
 * Pipe the distributable js files through the sizer to get a record of
 * the content size before and after gzip and cleanup any temporary file
 * output from the process.
 */
function sizeTask() {
  return gulp.src(['dist/**/*.js', 'dist.3p/{current,current-min}/**/*.js'])
    .pipe(sizer())
    .pipe(gulp.dest(tempFolderName))
    .on('end', del.bind(null, [tempFolderName]));
}

function rebuildAndSize() {
  runSequence('clean', 'build', 'dist', 'size');
}

gulp.task('size', 'Runs a report on artifact size', sizeTask);

// NOTE: (erwinm) this does not currently work properly as `build`
// and or `dist` are currently not fully asynchronous.
gulp.task('dist:size', 'Rebuilds and runs size', rebuildAndSize);
