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
'use strict';


const BBPromise = require('bluebird');
const childProcess = require('child_process');
const exec = BBPromise.promisify(childProcess.exec);
const colors = require('ansi-colors');
const fs = BBPromise.promisifyAll(require('fs'));
const log = require('fancy-log');


const prettyBytesUnits = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

/**
 * @typedef {!Array<FieldsDef>}
 */
let TablesDef;

/**
 * @typedef {{
 *   name: string,
 *   dateTime: string,
 *   size: string
 * }}
 */
let FieldsDef;

const filePath = 'test/size.txt';

const tableHeaders = [
  ['"datetime"'],
];

const dateTimes = [];

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
 * @return {!TablesDef}
 */
function parseSizeFile(file) {
  const lines = file.trim().split('\n');
  const headers = lines[0].trim().split('|').map(x => x.trim());
  let minPos = -1;
  // Find the "min" column which is the closure compiled or the "size" column
  // which was previously babelify compiled file.
  for (let i = 0; i < headers.length; i++) {
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
    const columns = line.split('|').map(x => x.trim());
    let name = columns[columns.length - 1];

    // Older size.txt files contained duplicate entries of the same "entity",
    // for example a file had an entry for its .min and its .max file.
    const shouldSkip = (name.endsWith('max.js') &&
        !name.endsWith('alp.max.js') && !/\s\/\s/.test(name))
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
    } else if (name == 'sw.js / sw.max.js') {
      name = 'sw.js';
    } else if (name == 'sw-kill.js / sw-kill.max.js') {
      name = 'sw-kill.js';
    } else if (name == 'a4a-host-v0.js / amp-inabox-host.js') {
      name = 'amp4ads-host-v0.js / amp-inabox-host.js';
    } else if (name == 'a4a-v0.js / amp-inabox.js') {
      name = 'amp4ads-v0.js / amp-inabox.js';
    }

    return {
      name: `"${name}"`,
      size: `"${reversePrettyBytes(columns[minPos])}"`,
    };
  }).filter(x => !!x);
}

/**
 * @param {!Array<string>} dateTimes
 * @param {!TablesDef} tables
 * @return {!Array<!Array<string>>}
 */
function mergeTables(dateTimes, tables) {
  // Where key is filename
  /** @typedef {!Object<string, !Array<{size: string, date: string}>>} */
  const obj = Object.create(null);
  const rows = [];

  // Aggregate all fields with same file name into an array
  tables.forEach(table => {
    table.forEach(field => {
      const {name} = field;
      if (!obj[name]) {
        obj[name] = [];
      }
      obj[name].push({
        size: field.size,
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
    const row =
        Array.apply(null, Array(tableHeaders[0].length)).map(() => '""');
    rows.push(row);
    row[0] = dateTime;
    // Exclude the datetime column
    tableHeaders[0].slice(1).forEach((fileName, colIdx) => {
      colIdx = colIdx + 1;
      let curField = null;
      for (let i = 0; i < obj[fileName].length; i++) {
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
 * @param {string} prettyBytes
 * @return {number}
 */
function reversePrettyBytes(prettyBytes) {
  const triple = prettyBytes.match(
      /(\d+(?:\.\d+)?)\s+(B|kB|MB|GB|TB|PB|EB|ZB|YB)/);
  if (!triple) {
    throw new Error('No matching bytes data found');
  }
  const value = triple[1];
  const unit = triple[2];

  if (!(value && unit)) {
    return 0;
  }
  const exponent = prettyBytesUnits.indexOf(unit);
  return (Number(value) * Math.pow(1000, exponent)).toFixed(3);
}

/**
 * Iterates through the commits and tries to checkout the file
 * @param {!Array<string>} logs
 * @return {!Promise}
 */
function serializeCheckout(logs) {
  const tables = [];
  const promise = logs.reduce((acc, cur, i) => {
    const parts = logs[i].split(' ');
    const sha = parts.shift();
    const dateTime = parts.join(' ');

    return acc.then(tables => {
      // We checkout all the known commits for the file and accumulate
      // all the tables.
      return exec(`git checkout ${sha} ${filePath}`).then(() => {
        return fs.readFileAsync(`${filePath}`);
      }).then(file => {
        const quotedDateTime = `"${dateTime}"`;
        dateTimes.push(quotedDateTime);
        // We convert the read file string into an Table objects
        const fields = parseSizeFile(file.toString()).map(field => {
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
        log(colors.red(e.message));
      });
    });
  }, Promise.resolve(tables));
  return promise.then(mergeTables.bind(null, dateTimes));
}

async function csvifySize() {
  const shaAndDate = '%H %ai';
  return getLog(shaAndDate)
      .then(logs => {
        // Reverse it from oldest to newest
        return serializeCheckout(logs.reverse()).then(rows => {
          rows.unshift.apply(rows, tableHeaders);
          const tbl = rows.map(row => row.join(',')).join('\n');
          return fs.writeFileAsync('test/size.csv', `${tbl}\n`);
        });
      });
}

module.exports = {
  csvifySize,
  parseSizeFile,
  mergeTables,
};

csvifySize.description = 'Creates a CSV file out of the size.txt file';
