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

const argv = require('minimist')(process.argv.slice(2));
const loadConfig = require('./load-config');
const measureDocuments = require('./measure-documents');
const runTests = require('./run-tests');
const writeMetrics = require('./write-metrics');
const {
  buildMinifiedRuntime,
  buildUnminifiedRuntime,
  installPackages,
} = require('../../common/utils');
const {CONTROL, EXPERIMENT, HOST, PORT} = require('./helpers');
const {printReport} = require('./print-report');
const {startServer, stopServer} = require('../serve');

async function setupExperimentTests() {
  installPackages(__dirname);
  if (!argv.nobuild) {
    if (argv.compiled) {
      buildMinifiedRuntime();
    } else {
      buildUnminifiedRuntime();
    }
  }

  await startServer(
    {host: HOST, port: PORT},
    {quiet: !argv.debug},
    {compiled: !!argv.compiled}
  );
}

async function setupControlTests() {
  await startServer(
    {host: HOST, port: PORT},
    {quiet: !argv.debug},
    {cdn: true}
  );
}

/**
 * @return {!Promise}
 */
async function performance() {
  const {headless, runs, urls} = new loadConfig();
  const results = {};

  await setupExperimentTests();
  results[EXPERIMENT] = await measureDocuments(urls, EXPERIMENT, {
    headless,
    runs,
  });
  stopServer();

  await setupControlTests();
  results[CONTROL] = await measureDocuments(urls, CONTROL, {
    headless,
    runs,
  });
  stopServer();

  writeMetrics(urls, results);
  runTests();
  printReport(urls);
}

performance.description = 'Runs web performance test on current branch';

performance.flags = {
  'compiled': '  Compiles and serves minified runtime',
  'nobuild': '  Does not compile runtime before running tests',
  'threshold':
    '  Fraction by which metrics are allowed to increase. Number between 0.0 and 1.0',
  'url': '  Page to test. Overrides urls set in config.json',
};

module.exports = {
  performance,
};
