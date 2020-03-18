/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const fs = require('fs');
const {CONTROL, EXPERIMENT, RESULTS_PATH} = require('./helpers');

const HEADER_COLUMN = 22;
const BODY_COLUMN = 12;
const FULL_TABLE = 68;

/**
 * Computes an average for the specified key's values in the array of objects
 *
 * @param {Array<*>} arr
 * @param {string} key
 * @return {number} average
 */
const average = (arr, key) =>
  Math.round(arr.reduce((sum, result) => sum + result[key], 0) / arr.length);

/**
 * Takes two numbers and generates a string representing the difference as
 * a percent for use in printing the results
 *
 * @param {number} a
 * @param {number} b
 * @return {string} String representing the change as a percent
 */
function percent(a, b) {
  if (a === 0) {
    return b === 0 ? 'n/a' : `-${100 - Math.round((a / b) * 100)}`;
  } else {
    return `${100 - Math.round((b / a) * 100)}%`;
  }
}

/**
 * Generates header lines to be printed to the console for url
 *
 * @param {string} url
 * @return {Array<string>} lines
 */
const headerLines = url => [
  '\nPAGE LOAD METRICS\n',
  `${url}\n\n`,
  [
    'METRIC'.padEnd(HEADER_COLUMN),
    'BRANCH'.padEnd(BODY_COLUMN),
    'PRODUCTION'.padEnd(BODY_COLUMN),
    'CHANGE'.padEnd(BODY_COLUMN),
  ].join(' | '),
  `\n${''.padEnd(FULL_TABLE, '-')}\n`,
];

/**
 * Generates row to be printed to the console for the metric
 *
 * @param {string} metric
 * @param {Array<*>} results
 * @return {Array<string>} lines
 */
function linesForMetric(metric, results) {
  const control = average(results[CONTROL], metric);
  const experiment = average(results[EXPERIMENT], metric);

  return [
    [
      metric.padEnd(HEADER_COLUMN),
      experiment.toString().padEnd(BODY_COLUMN),
      control.toString().padEnd(BODY_COLUMN),
      percent(control, experiment),
    ].join(' | '),
    `\n${''.padEnd(FULL_TABLE, '-')}\n`,
  ];
}

function printReport(urls) {
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH));

  urls.forEach(url => {
    const keys = Object.keys(results[url][CONTROL][0]);
    let lines = [];
    lines = [...lines, ...headerLines(url)];
    lines = [...lines, ...keys.flatMap(m => linesForMetric(m, results[url]))];
    console /* OK */
      .log(...lines);
  });
}

module.exports = printReport;
