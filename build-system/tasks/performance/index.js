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
const copyLocalImages = require('./copy-images');
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
  let resolver;
  const deferred = new Promise((resolverIn) => {
    resolver = resolverIn;
  });

  installPackages(__dirname);
  const config = new loadConfig();
  const urls = Object.keys(config.urlToHandlers);
  const urlsAndAdsUrls = urls.concat(config.adsUrls || []);
  await cacheDocuments(urlsAndAdsUrls);
  await compileScripts(urlsAndAdsUrls);
  copyLocalImages(urlsAndAdsUrls);
  await rewriteScriptTags(urlsAndAdsUrls);
  await rewriteAnalyticsTags(config.handlers);
  await getMetrics(urls, config);
  printReport(urls);
  await runTests(resolver);
  return deferred;
}

performance.description = 'Runs web performance test on current branch';

performance.flags = {
  'devtools': '  Run with devtools open',
  'headless': '  Run chromium headless',
  'nobuild': '  Does not compile minified runtime before running tests',
  'threshold':
    '  Fraction by which metrics are allowed to increase. Number between 0.0 and 1.0',
  'quiet': '  Does not log progress per page',
  'url': '  Page to test. Overrides urls set in config.json',
};

module.exports = {
  performance,
};
