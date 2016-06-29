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


var BBPromise = require('bluebird');
var child_process = require('child_process');
var exec = BBPromise.promisify(child_process.exec);
var fs = BBPromise.promisifyAll(require('fs'));
var git = require('gulp-git');
var gulp = require('gulp-help')(require('gulp'));
var table = require('text-table');
var util = require('gulp-util');


/**
 * @typedef {!Array<Fields>}
 */
var Tables;

/**
 * @typedef {{
 *   name: string,
 *   dateTime: string,
 *   size: string
 * }}
 */
var Fields;

var filePath = 'test/size.txt';

var fileSizes = Object.create(null);

var tableHeaders = [
  ['"datetime"']
];

var tableOptions = {
  hsep: ','
};

var dateTimes = [];

/**
 * @param {string} format
 * @return {!Array<string>}
 */
function getLog(format) {
  return exec(`git log --format="${format}" ${filePath}`)
      .then(logs => logs.trim().split('\n'));
}

/**
 * @param {string} file
 * @return {!Tables}
 */
function parseSizeFile(file) {
  var lines = file.trim().split('\n');
  var minSizePos = 0;
  var headers = lines[0].trim().split('|').map(x => x.trim());
  var minPos = -1;
  // Find the "min" column which is the closure compiled or the "size" column
  // which was previously babelify compiled file.
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] == 'min' || headers[i] == 'size') {
      minPos = i;
      break;
    }
  }

  // Remove headers
  lines.shift();
  // Remove separator
  lines.shift();

  return lines.map(line => {
    var columns = line.split('|').map(x => x.trim());
    var name = columns[columns.length - 1];

    // Older size.txt files contained duplicate entries of the same "entity",
    // for example a file had an entry for its .min and its .max file.
    var shouldSkip = (name.endsWith('max.js') && !name.endsWith('alp.max.js'))
        || name == 'current/integration.js' || name == 'amp.js' ||
        name == 'cc.js' || name.endsWith('-latest.js');


    if (shouldSkip) {
      return null;
    }

    // Normalize names. We made mistakes at some point with duplicate entries
    // or renamed entries so we make sure to identify these entities
    // and put then into the same column.
    if (name == 'v0.js / amp.js' || name == 'current-min/v0.js') {
      name = 'v0.js';
    } else if (name == 'current-min/f.js / current/integration.js' ||
      name == 'current-min/f.js') {
      name = 'f.js';
    } else if (name == 'alp.max.js' || name == 'alp.js / install-alp.js' ||
        name == 'alp.js / alp.max.js') {
      name = 'alp.js';
    }

    return {
      name: `"${name}"`,
      size: `"${columns[minPos]}"`,
    };
  }).filter(x => !!x);
}

/**
 * @param {!Array<string>} dateTimes
 * @param {!Tables} tables
 * @return {!Array<!Array<string>>}
 */
function mergeTables(dateTimes, tables) {
  // Where key is filename
  /** @typedef {!Object<string, !Array<{size: string, date: string}>>} */
  var obj = Object.create(null);
  var rows = [];

  // Aggregate all fields with same file name into an array
  tables.forEach(table => {
    table.forEach(field => {
      var name = field.name;
      if (!obj[name]) {
        obj[name] = [];
      }
      // Match only numeric values
      var size = (field.size.match(/\d+(?:\.\d+)?/) || [])[0] || '';
      obj[name].push({
        size: `"${size}"`,
        dateTime: field.dateTime,
      });
    });
  });

  // Populate the headers array with unique file names for row 1
  Object.keys(obj).sort().forEach(fileName => {
    // TODO(erwinm): figure out where this is occurring.
    if (fileName.trim() == '""') {
      return;
    }
    tableHeaders[0].push(fileName);
  });

  // Populate column A with all the dates we've seen and then
  // populate all other columns with their respective file size if any.
  dateTimes.forEach(dateTime => {
    // Seed array with empty string values
    var row = Array.apply(null, Array(tableHeaders[0].length)).map(x => '""');
    rows.push(row);
    row[0] = dateTime;
    // Exclude the datetime column
    tableHeaders[0].slice(1).forEach((fileName, colIdx) => {
      var colIdx = colIdx + 1;
      var curField = null;
      for (var i = 0; i < obj[fileName].length; i++) {
        curField = obj[fileName][i];
        if (curField.dateTime == dateTime) {
          row[colIdx] = curField.size;
          break;
        }
      }
    });
  });
  return rows;
}

/**
 * Iterates through the commits and tries to checkout the file
 * @param {!Array<string>} logs
 * @return {!Promise}
 */
function serializeCheckout(logs) {
  var tables = [];
  var promise = logs.reduce((acc, cur, i) => {
    var parts = logs[i].split(' ');
    var sha = parts.shift();
    var dateTime = parts.join(' ');

    return acc.then(tables => {
      // We checkout all the known commits for the file and accumulate
      // all the tables.
      return exec(`git checkout ${sha} ${filePath}`).then(() => {
        return fs.readFileAsync(`${filePath}`);
      }).then(file => {
        var quotedDateTime = `"${dateTime}"`;
        dateTimes.push(quotedDateTime);
        // We convert the read file string into an Table objects
        var fields = parseSizeFile(file.toString()).map(field => {
          field.dateTime = quotedDateTime;
          return field;
        });
        tables.push(fields);
        return tables;
      }).catch(e => {
        // Ignore if pathspec error. This can happen if the file was
        // deleted in git.
        if (/error: pathspec/.test(e.message)) {
          tables.push([]);
          return tables;
        }
        util.log(util.colors.red(e.message));
      });
    });
  }, Promise.resolve(tables));
  return promise.then(mergeTables.bind(null, dateTimes));
}

function csvify() {
  var shaAndDate = "%H %ai";
  return getLog(shaAndDate)
      .then(logs => {
        // Reverse it from oldest to newest
        return serializeCheckout(logs.reverse()).then(rows => {
          rows.unshift.apply(rows, tableHeaders);
          var alignOptions = Array
              .apply(null, Array(tableHeaders[0].length)).map(x => 'l');
          var tbl = table(rows, tableOptions);

          return fs.writeFileAsync('test/size.csv', `${tbl}\n`);
        });
      });
}

gulp.task('csvify-size', 'create a CSV file out of the size.txt file', csvify);

exports.parseSizeFile = parseSizeFile;
exports.mergeTables = mergeTables;
