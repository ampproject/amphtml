
'use strict';

const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const {ciBuildSha, circleciBuildNumber} = require('../common/ci');
const {cyan} = require('../common/colors');
const {getLoggingPrefix, logWithoutTimestamp} = require('../common/logging');
const {replaceUrls: replaceUrlsAppUtil} = require('../server/app-utils');

const hostNamePrefix = 'https://storage.googleapis.com/amp-test-website-1';
const prDeployBotBaseUrl =
  'https://amp-pr-deploy-bot.appspot.com/v0/pr-deploy/';

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
  const result = replaceUrlsAppUtil('minified', data, hostName);

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
  const maybeJobId = result == 'success' ? `/${circleciBuildNumber()}` : '';
  const url = `${prDeployBotBaseUrl}headshas/${sha}/${result}${maybeJobId}`;
  await fetch(url, {method: 'POST'});
}

module.exports = {
  getBaseUrl,
  replaceUrls,
  signalPrDeployUpload,
};
