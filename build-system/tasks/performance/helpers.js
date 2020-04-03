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

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const CDN_URL = 'https://cdn.ampproject.org/';
const AMP_JS_PATH = '/dist/amp.js';
const LOCAL_PATH_REGEXP = /dist\/(v0\/amp-[A-Za-z\-0-9\.]+).max(.js)/;
const ANALYTICS_VENDORS_PATH = 'extensions/amp-analytics/0.1/vendors/';
const CDN_ANALYTICS_REGEXP = /https:\/\/cdn.ampproject.org\/rtv\/\d{15}\/v0\/analytics-vendors\/([\.\-\_0-9A-Za-z]+\.json)/;
const CONTROL = 'control';
const EXPERIMENT = 'experiment';
const CACHE_PATH = path.join(__dirname, './cache');
const CONTROL_CACHE_PATH = path.join(CACHE_PATH, `./${CONTROL}`);
const EXPERIMENT_CACHE_PATH = path.join(CACHE_PATH, `./${EXPERIMENT}`);
const RESULTS_PATH = path.join(__dirname, './results.json');

/**
 * Makes cache directories if they do not exist
 */
function touchDirs() {
  [
    CACHE_PATH,
    CONTROL_CACHE_PATH,
    path.join(CONTROL_CACHE_PATH, 'v0'),
    EXPERIMENT_CACHE_PATH,
    path.join(EXPERIMENT_CACHE_PATH, 'v0'),
  ].forEach((dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  });
}

/**
 * Takes a URL string and sanitizes it for use as a filename.
 * Appends `.html` if no extension is present because otherwise
 * Chrome will not open the file as a webpage.
 *
 * @param {string} url
 * @param {string} version Experiment or Control
 * @return {string}
 */
function urlToCachePath(url, version = CONTROL) {
  const directory =
    version === CONTROL ? CONTROL_CACHE_PATH : EXPERIMENT_CACHE_PATH;
  let sanitized = url.replace(/:/g, '').replace(/\//g, '_');
  sanitized = /\.js|\.html/.test(sanitized) ? sanitized : `${sanitized}.html`;
  return path.join(directory, sanitized);
}

/**
 * Download a file to cache by url
 *
 * @param {string} url
 * @param {string} version
 * @return {!Promise<string>} Resolves with relative path to file
 */
function downloadToDisk(url, version = CONTROL) {
  touchDirs();

  return fetch(url)
    .then((response) => response.text())
    .then((document) => {
      const filepath = urlToCachePath(url, version);
      fs.writeFileSync(filepath, document);
      return filepath.split(`performance/cache/${version}/`)[1];
    });
}

/**
 * Copy a script file from /dist to cache from filePath
 *
 * @param {string} filePath
 * @param {string} version
 * @return {!Promise<string>} Resolves with relative path to file
 */
function copyToCache(filePath, version = EXPERIMENT) {
  touchDirs();

  const fromPath = path.join(__dirname, '../../../dist/', filePath);
  const destDir =
    version === CONTROL ? CONTROL_CACHE_PATH : EXPERIMENT_CACHE_PATH;
  const destPath = path.join(destDir, filePath);

  fs.copyFileSync(fromPath, destPath);

  return Promise.resolve(filePath);
}

/**
 * Return file contents from filepath.
 *
 * @param {string} filePath
 * @return {!Promise<string>} Resolves with relative path to file
 */
function getFile(filePath) {
  const fromPath = path.join(__dirname, '../../../', filePath);
  return Promise.resolve(fs.readFileSync(fromPath));
}

module.exports = {
  AMP_JS_PATH,
  ANALYTICS_VENDORS_PATH,
  CDN_ANALYTICS_REGEXP,
  CDN_URL,
  CONTROL,
  EXPERIMENT,
  LOCAL_PATH_REGEXP,
  RESULTS_PATH,
  copyToCache,
  downloadToDisk,
  getFile,
  urlToCachePath,
};
