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

const cacheDocuments = require('./cache-documents');
const compileScripts = require('./compile-scripts');
const getMetrics = require('./measure-documents');
const loadConfig = require('./load-config');
const rewriteAnalyticsTags = require('./rewrite-analytics-tags');
const rewriteScriptTags = require('./rewrite-script-tags');
const runTests = require('./run-tests');
const {installPackages} = require('../../common/utils');
const {printReport} = require('./print-report');

/**
 * @return {!Promise}
 */
async function performance() {
  installPackages(__dirname);
  const config = new loadConfig();
  const urls = Object.keys(config.urlToHandlers);
  await cacheDocuments(urls);
  await compileScripts(urls);
  await rewriteScriptTags(urls);
  await rewriteAnalyticsTags(config.handlers);
  await getMetrics(urls, config);
  runTests();
  printReport(urls);
}

performance.description = 'Runs web performance test on current branch';

performance.flags = {
  'nobuild': '  Does not compile minified runtime before running tests',
  'threshold':
    '  Fraction by which metrics are allowed to increase. Number between 0.0 and 1.0',
  'url': '  Page to test. Overrides urls set in config.json',
};

module.exports = {
  performance,
};
