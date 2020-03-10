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
  ].forEach(dirPath => {
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
    .then(response => response.text())
    .then(document => {
      const filepath = urlToCachePath(url, version);
      fs.writeFileSync(filepath, document);
      return filepath.split(`performance/cache/${version}/`)[1];
    });
}

/**
 * Copy a script file from /dist to cache by url
 *
 * @param {string} url
 * @param {string} version
 * @return {!Promise<string>} Resolves with relative path to file
 */
function copyToCache(url, version = EXPERIMENT) {
  touchDirs();

  const filePath = url.split(CDN_URL)[1];

  const fromPath = path.join(__dirname, '../../../dist/', filePath);
  const destDir =
    version === CONTROL ? CONTROL_CACHE_PATH : EXPERIMENT_CACHE_PATH;
  const destPath = path.join(destDir, filePath);

  fs.copyFileSync(fromPath, destPath);

  return Promise.resolve(filePath);
}

module.exports = {
  CDN_URL,
  CONTROL,
  EXPERIMENT,
  RESULTS_PATH,
  copyToCache,
  downloadToDisk,
  urlToCachePath,
};
