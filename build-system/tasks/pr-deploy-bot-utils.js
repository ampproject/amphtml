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
const log = require('fancy-log');
const path = require('path');
const request = require('request-promise');
const {cyan, green} = require('ansi-colors');
const {gitCommitHash} = require('../common/git');
const {replaceUrls: replaceUrlsAppUtil} = require('../server/app-utils');
const {travisBuildNumber} = require('../common/travis');

const hostNamePrefix = 'https://storage.googleapis.com/amp-test-website-1';

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

async function replace(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  const hostName = `${hostNamePrefix}/amp_dist_${travisBuildNumber()}`;
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

async function replaceUrls(dir) {
  const files = await walk(dir);
  const promises = files
    .filter((fileName) => path.extname(fileName) == '.html')
    .map((file) => replace(file));
  await Promise.all(promises);
}

async function signalDistUpload(result) {
  const sha = gitCommitHash();
  const travisBuild = travisBuildNumber();
  const baseUrl = 'https://amp-pr-deploy-bot.appspot.com/v0/pr-deploy/';
  const url = `${baseUrl}travisbuilds/${travisBuild}/headshas/${sha}/${result}`;

  await request.post(url);
  log(
    green('INFO:'),
    'reported ',
    cyan(`dist: ${result}`),
    'to the pr-deploy GitHub App'
  );
}

module.exports = {
  replaceUrls,
  signalDistUpload,
};
