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
const log = require('fancy-log');
const printReport = require('./print-report');
const rewriteScriptTags = require('./rewrite-script-tags');
const {cyan} = require('ansi-colors');
const {execOrDie} = require('../../common/exec');

function installPackages_() {
  log('Running', cyan('yarn'), 'to install packages...');
  execOrDie('npx yarn --cwd build-system/tasks/performance', {
    'stdio': 'ignore',
  });
}

/**
 * @return {!Promise}
 */
async function performance() {
  installPackages_();
  const {headless, runs, urls} = new loadConfig();
  await cacheDocuments(urls);
  await compileScripts(urls);
  await rewriteScriptTags(urls);
  await getMetrics(urls, {headless, runs});
  printReport(urls);
}

performance.description = '  Runs web performance test on current branch';

performance.flags = {
  'nobuild': 'Does not compile javascripts before running tests',
};

module.exports = {
  performance,
};
