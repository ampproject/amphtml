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
'use strict';

const fs = require('fs-extra');
const path = require('path');
const request = require('request-promise');
const {ciBuildSha} = require('../common/ci');
const {cyan} = require('kleur/colors');
const {getLoggingPrefix, logWithoutTimestamp} = require('../common/logging');
const {replaceUrls: replaceUrlsAppUtil} = require('../server/app-utils');

const hostNamePrefix = 'https://storage.googleapis.com/amp-test-website-1';

/**
 * @param {string} dest
 * @return {Promise<string[]>}
 */
async function walk(dest) {
  const filelist = [];
  const files = await fs.readdir(dest);

  for (let i = 0; i < files.length; i++) {
    const file = `${dest}/${files[i]}`;

    fs.statSync(file).isDirectory()
      ? Array.prototype.push.apply(filelist, await walk(file))
      : filelist.push(file);
  }

  return filelist;
}

/**
 * @return {string}
 */
function getBaseUrl() {
  return `${hostNamePrefix}/amp_nomodule_${ciBuildSha()}`;
}

/**
 * @param {string} filePath
 * @return {Promise<void>}
 */
async function replace(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  const hostName = getBaseUrl();
  const inabox = false;
  const storyV1 = true;
  const result = replaceUrlsAppUtil(
    'compiled',
    data,
    hostName,
    inabox,
    storyV1
  );

  await fs.writeFile(filePath, result, 'utf8');
}

/**
 * @param {string} dir
 * @return {Promise<void>}
 */
async function replaceUrls(dir) {
  const files = await walk(dir);
  const promises = files
    .filter((fileName) => path.extname(fileName) == '.html')
    .map((file) => replace(file));
  await Promise.all(promises);
}

/**
 * @param {string} result
 * @return {Promise<void>}
 */
async function signalPrDeployUpload(result) {
  const loggingPrefix = getLoggingPrefix();
  logWithoutTimestamp(
    `${loggingPrefix} Reporting`,
    cyan(result),
    'to the pr-deploy GitHub App...'
  );
  const sha = ciBuildSha();
  const baseUrl = 'https://amp-pr-deploy-bot.appspot.com/v0/pr-deploy/';
  const url = `${baseUrl}headshas/${sha}/${result}`;
  await request.post(url);
}

module.exports = {
  getBaseUrl,
  replaceUrls,
  signalPrDeployUpload,
};
