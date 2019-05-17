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

const del = require('del');
const fs = require('fs');
const gulp = require('gulp-help')(require('gulp'));
const gzipSize = require('gzip-size');
const PluginError = require('plugin-error');
const prettyBytes = require('pretty-bytes');
const table = require('text-table');
const through = require('through2');

const tempFolderName = '__size-temp';

const MIN_FILE_SIZE_POS = 0;
const FILENAME_POS = 2;

// normalized table headers
const tableHeaders = [
  ['max', 'min', 'gzip', 'file'],
  ['---', '---', '---', '---'],
];

const tableOptions = {
  align: ['r', 'r', 'r', 'l'],
  hsep: '   |   ',
};

/**
 * Returns a number greater than -1 if item is found within the array, else
 * returns -1.
 *
 * @param {!Array<!Array>} rows
 * @param {!fuction(string)} predicate
 * @return {number}
 */
function findMaxIndexByFilename(rows, predicate) {
  for (let i = 0; i < rows.length; i++) {
    const curRow = rows[i];
    const curFilename = curRow[FILENAME_POS];
    if (predicate(curFilename)) {
      return i;
    }
  }
  return -1;
}

/**
 * Mutates the rows in place and merges the minified file entry as well
 * as its unminified file entry counterpart.
 * @param {!Array<!Array>} rows
 * @param {string} minFilename
 * @param {string} maxFilename
 * @param {boolean} mergeNames
 */
function normalizeRow(rows, minFilename, maxFilename, mergeNames) {
  const minIndex = findMaxIndexByFilename(rows, function(filename) {
    return filename == minFilename;
  });
  const maxIndex = findMaxIndexByFilename(rows, function(filename) {
    return filename == maxFilename;
  });

  if (maxIndex != -1 && minIndex != -1) {
    if (mergeNames) {
      rows[minIndex][FILENAME_POS] += ' / ' + rows[maxIndex][FILENAME_POS];
    }
    rows[minIndex].unshift(rows[maxIndex][MIN_FILE_SIZE_POS]);
    rows.splice(maxIndex, 1);
  }
}

/**
 * Call normalizeRow on the core file, integration file and all extensions.
 * @param {!Array<!Array>} rows
 * @return {!Array<!Array>}
 */
function normalizeRows(rows) {
  // normalize amp.js
  normalizeRow(rows, 'v0.js', 'amp.js', true);

  // normalize integration.js
  normalizeRow(rows, 'current-min/f.js', 'current/integration.js', true);

  normalizeRow(
    rows,
    'current-min/ampcontext-v0.js',
    'current/ampcontext-lib.js',
    true
  );

  normalizeRow(
    rows,
    'current-min/iframe-transport-client-v0.js',
    'current/iframe-transport-client-lib.js',
    true
  );

  // normalize alp.js
  normalizeRow(rows, 'alp.js', 'alp.max.js', true);

  // normalize amp-shadow.js
  normalizeRow(rows, 'shadow-v0.js', 'amp-shadow.js', true);

  normalizeRow(rows, 'amp4ads-v0.js', 'amp-inabox.js', true);

  normalizeRow(rows, 'amp4ads-host-v0.js', 'amp-inabox-host.js', true);

  normalizeRow(rows, 'examiner.js', 'examiner.max.js', true);

  normalizeRow(rows, 'ww.js', 'ww.max.js', true);

  // normalize sw.js
  normalizeRow(rows, 'sw.js', 'sw.max.js', true);
  normalizeRow(rows, 'sw-kill.js', 'sw-kill.max.js', true);

  // normalize extensions
  let curName = null;
  let i = rows.length;
  // we are mutating in place... kind of icky but this will do fow now.
  while (i--) {
    curName = rows[i][FILENAME_POS];
    if (/^v0/.test(curName)) {
      normalizeExtension(rows, curName);
    }
  }
  return rows;
}

/**
 * Finds the counterpart entry of the extension file, wether it be
 * the unminified or the minified counterpart.
 * @param {!Array<!Array>} rows
 * @param {string} filename
 */
function normalizeExtension(rows, filename) {
  const isMax = /\.max\.js$/.test(filename);
  const counterpartName = filename.replace(/(v0\/.*?)(\.max)?(\.js)$/, function(
    full,
    grp1,
    grp2,
    grp3
  ) {
    if (isMax) {
      return grp1 + grp3;
    }
    return full;
  });

  if (isMax) {
    normalizeRow(rows, counterpartName, filename, false);
  } else {
    normalizeRow(rows, filename, counterpartName, false);
  }
}

/**
 * Through2 transform function - Tracks the original size and the gzipped size
 * of the file content in the rows array. Passes the file and/or err to the
 * callback when finished.
 * @param {!Array<!Array<string>>} rows array to store content size information
 * @param {!File} file File to process
 * @param {string} enc Encoding (not used)
 * @param {function(?Error, !File)} cb Callback function
 */
function onFileThrough(rows, file, enc, cb) {
  if (file.isNull()) {
    cb(null, file);
    return;
  }

  if (file.isStream()) {
    cb(new PluginError('size', 'Stream not supported'));
    return;
  }

  rows.push([
    prettyBytes(file.contents.length),
    prettyBytes(gzipSize.sync(file.contents)),
    file.relative,
  ]);

  cb(null, file);
}

/**
 * Through2 flush function - combines headers with the rows and generates
 * a text-table of the content size information to log to the console and the
 * test/size.txt logfile.
 *
 * @param {!Array<!Array<string>>} rows array of content size information
 * @param {function()} cb Callback function
 */
function onFileThroughEnd(rows, cb) {
  rows = normalizeRows(rows);
  rows.unshift.apply(rows, tableHeaders);
  const tbl = table(rows, tableOptions);
  console /* OK*/
    .log(tbl);
  fs.writeFileSync('test/size.txt', tbl);
  cb();
}

/**
 * Setup through2 to capture size information using the above transform and
 * flush functions on a stream
 * @return {!Stream} a Writable Stream
 */
function sizer() {
  const rows = [];
  return through.obj(
    onFileThrough.bind(null, rows),
    onFileThroughEnd.bind(null, rows)
  );
}

/**
 * Pipe the distributable js files through the sizer to get a record of
 * the content size before and after gzip and cleanup any temporary file
 * output from the process.
 */
function size() {
  gulp
    .src([
      'dist/**/*.js',
      '!dist/**/*-latest.js',
      '!dist/**/*check-types.js',
      '!dist/**/amp-viewer-host.max.js',
      'dist.3p/{current,current-min}/**/*.js',
    ])
    .pipe(sizer())
    .pipe(gulp.dest(tempFolderName))
    .on('end', del.bind(null, [tempFolderName]));
}

module.exports = {
  size,
};

size.description = 'Runs a report on artifact size';
