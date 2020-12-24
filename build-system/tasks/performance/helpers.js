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
const INABOX_PATH = '/dist/amp4ads-v0.js';
const LOCAL_PATH_REGEXP = /dist\/(v0\/amp-[A-Za-z\-0-9\.]+.js)/;
const ANALYTICS_VENDORS_PATH = '../../../dist/v0/analytics-vendors/';
const CONTROL = 'control';
const EXPERIMENT = 'experiment';
const CACHE_PATH = path.join(__dirname, './cache');
const CONTROL_CACHE_PATH = path.join(CACHE_PATH, `./${CONTROL}`);
const EXPERIMENT_CACHE_PATH = path.join(CACHE_PATH, `./${EXPERIMENT}`);
const IMG_CACHE_PATH = path.join(CACHE_PATH, './img');
const RESULTS_PATH = path.join(__dirname, './results.json');
const DEFAULT_EXTENSIONS = ['amp-auto-lightbox-0.1.js', 'amp-loader-0.1.js'];

/**
 * Makes cache directories if they do not exist
 */
function touchDirs() {
  [
    CACHE_PATH,
    IMG_CACHE_PATH,
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
async function downloadToDisk(url, version = CONTROL) {
  touchDirs();

  const response = await fetch(url);
  const document = await response.text();
  const filepath = urlToCachePath(url, version);
  fs.writeFileSync(filepath, document);

  return filepath.split(`performance/cache/${version}/`)[1];
}

/**
 * Copy a script file from /dist to cache from filePath
 *
 * @param {string} filePath
 * @param {string} version
 * @return {!Promise<string>} Resolves with relative path to file
 */
async function copyToCache(filePath, version = EXPERIMENT) {
  touchDirs();

  const fromPath = path.join(__dirname, '../../../dist/', filePath);
  const destDir =
    version === CONTROL ? CONTROL_CACHE_PATH : EXPERIMENT_CACHE_PATH;
  const destPath = path.join(destDir, filePath);

  fs.copyFileSync(fromPath, destPath);

  return filePath;
}

/**
 * Copy an image from absoluteImgPath to cache/img if not present.
 * To be used by both control and experiment
 *
 * @param {string} configUrl
 * @param {string} src
 */
function maybeCopyImageToCache(configUrl, src) {
  // Remove `?...` that may be used at the end of the src for uniqueness
  src = src.split('?')[0];
  const absoluteFromImgPath = getAbsolutePathFromRelativePath(configUrl, src);

  if (src.startsWith('http') || !fs.existsSync(absoluteFromImgPath)) {
    return;
  }

  touchDirs();

  const filename = src.split('/').pop();
  const destPath = path.join(IMG_CACHE_PATH, filename);

  if (!fs.existsSync(destPath)) {
    fs.copyFileSync(absoluteFromImgPath, destPath);
  }
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
async function getFileFromAbsolutePath(filePath) {
  return fs.readFileSync(filePath);
}

/**
 * Strip localhost:8000 from url and remove the filename
 *
 * @param {string} testPageUrl
 * @return {string}
 */
function getFolderLocation(testPageUrl) {
  const removedLocalHost = testPageUrl
    .split('http://localhost:8000')[1]
    .split('/');
  removedLocalHost.pop();
  return removedLocalHost.join('/');
}

/**
 * Get the absolute path of the relative src
 *
 * @param {string} testPageUrl
 * @param {string} src
 * @return {string}
 */
function getAbsolutePathFromRelativePath(testPageUrl, src) {
  return path.join(__dirname, '../../..', getFolderLocation(testPageUrl), src);
}

module.exports = {
  CDN_URL,
  CONTROL,
  DEFAULT_EXTENSIONS,
  EXPERIMENT,
  INABOX_PATH,
  LOCAL_PATH_REGEXP,
  RESULTS_PATH,
  V0_PATH,
  copyToCache,
  maybeCopyImageToCache,
  downloadToDisk,
  getFileFromAbsolutePath,
  getLocalPathFromExtension,
  getLocalVendorConfig,
  getAbsolutePathFromRelativePath,
  localFileToCachePath,
  urlToCachePath,
};
