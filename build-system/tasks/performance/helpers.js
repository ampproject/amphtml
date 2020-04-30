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
const V0_PATH = '/dist/v0.js';
const LOCAL_PATH_REGEXP = /dist\/(v0\/amp-[A-Za-z\-0-9\.]+.js)/;
const ANALYTICS_VENDORS_PATH = '../../../dist/v0/analytics-vendors/';
const CONTROL = 'control';
const EXPERIMENT = 'experiment';
const CACHE_PATH = path.join(__dirname, './cache');
const CONTROL_CACHE_PATH = path.join(CACHE_PATH, `./${CONTROL}`);
const EXPERIMENT_CACHE_PATH = path.join(CACHE_PATH, `./${EXPERIMENT}`);
const RESULTS_PATH = path.join(__dirname, './results.json');
const DEFAULT_EXTENSIONS = ['amp-auto-lightbox-0.1.js', 'amp-loader-0.1.js'];

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
 * @param {string} file
 * @param {string} version Experiment or Control
 * @return {string}
 */
function localFileToCachePath(file, version = EXPERIMENT) {
  const directory =
    version === CONTROL ? CONTROL_CACHE_PATH : EXPERIMENT_CACHE_PATH;
  return path.join(directory, file);
}

/**
 * @param {string} extension
 * @return {string}
 */
function getLocalPathFromExtension(extension) {
  return `v0/` + extension;
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
 * Returns absolute path to vendor config.
 *
 * @param {string} vendor
 * @return {!Promise<string>} Resolves with relative path to file
 */
function getLocalVendorConfig(vendor) {
  const filepath = path.join(
    __dirname,
    ANALYTICS_VENDORS_PATH,
    vendor + '.json'
  );
  return getFileFromAbsolutePath(filepath);
}

/**
 * Return file contents from absolute filepath.
 *
 * @param {string} filePath
 * @return {!Promise<string>} Resolves with relative path to file
 */
function getFileFromAbsolutePath(filePath) {
  return Promise.resolve(fs.readFileSync(filePath));
}

module.exports = {
  V0_PATH,
  CDN_URL,
  CONTROL,
  DEFAULT_EXTENSIONS,
  EXPERIMENT,
  LOCAL_PATH_REGEXP,
  RESULTS_PATH,
  copyToCache,
  downloadToDisk,
  getFileFromAbsolutePath,
  getLocalPathFromExtension,
  getLocalVendorConfig,
  localFileToCachePath,
  urlToCachePath,
};
