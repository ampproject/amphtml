/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const minimist = require('minimist');
const {cyan, green} = require('../common/colors');
const {log} = require('../common/logging');
const {requireNewServerModule} = require('./typescript-compile');
const {URL} = require('url');

let serveMode = 'default';

/**
 * Returns a string representation of the server's mode.
 * @return {string}
 */
function getServeMode() {
  return serveMode;
}

/**
 * Sets the server's mode. Uses command line arguments by default, but can be
 * overridden by passing in a modeOptions object.
 * @param {!Object} modeOptions
 */
function setServeMode(modeOptions) {
  if (Object.keys(modeOptions).length == 0) {
    modeOptions = minimist(process.argv.slice(2), {string: ['rtv']});
  }

  if (modeOptions.compiled) {
    serveMode = 'compiled';
  } else if (modeOptions.esm) {
    serveMode = 'esm';
  } else if (modeOptions.cdn) {
    serveMode = 'cdn';
  } else if (modeOptions.rtv) {
    const {rtv} = modeOptions;
    if (isRtvMode(rtv)) {
      serveMode = rtv;
    } else {
      throw new Error(`Invalid rtv: ${rtv}. (Must be 15 digits long.)`);
    }
  }
}

/**
 * Logs the server's mode.
 */
function logServeMode() {
  const serveMode = getServeMode();
  if (serveMode == 'compiled') {
    log(green('Serving'), cyan('minified'), green('JS'));
  } else if (serveMode == 'esm') {
    log(green('Serving'), cyan('ESM'), green('JS'));
  } else if (serveMode == 'cdn') {
    log(green('Serving'), cyan('current prod'), green('JS'));
  } else if (isRtvMode(serveMode)) {
    log(green('Serving JS from RTV'), cyan(serveMode));
  } else {
    log(green('Serving'), cyan('unminified'), green('JS'));
  }
}

/**
 * @param {string} serveMode
 * @return {boolean}
 */
const isRtvMode = (serveMode) => {
  return /^\d{15}$/.test(serveMode);
};

/**
 * @param {string=} pathPattern
 * @return {RegExp}
 */
const getCdnUrlRegExp = (pathPattern = '[^\'">]+') =>
  new RegExp(
    `(https://cdn\\.ampproject\\.org)/${pathPattern}(\\.m?js|\\.css)`,
    'g'
  );

/**
 * @param  {string} html
 * @return {string}
 */
const toInaboxDocument = (html) =>
  html
    .replace(/<html [^>]*>/, '<html amp4ads>')
    .replace(getCdnUrlRegExp('v0'), '$1/amp4ads-v0$2');

/**
 * @param {URL} url
 * @return {string}
 */
const getHrefWithoutHost = ({host, href, protocol}) =>
  // 2 slashes // between protocol and host
  href.substr(protocol.length + 2 + host.length);

/**
 * @param {string} mode
 * @param {string} html
 * @param {string} hostName
 * @param {boolean} useMaxNames
 * @return {string}
 */
function replaceCdnJsUrls(mode, html, hostName, useMaxNames) {
  const {CDNURLToRTVURL, replaceCDNURLPath} =
    /** @type {import('./new-server/transforms/utilities/cdn')} */ (
      requireNewServerModule('utilities/cdn')
    );

  const pathnames = undefined; // we don't override the mapping, optional arg
  const isRtv = isRtvMode(mode);

  // TODO(alanorozco): Match --esm in output extension and/or allow
  // `.mjs` to be lazily built regardless of --esm
  return html.replace(getCdnUrlRegExp(), (urlString, _cdnPrefix, extension) => {
    const url = new URL(urlString);
    if (isRtv) {
      return CDNURLToRTVURL(url, mode, pathnames, extension).href;
    }
    // CSS files are never output as .max.css
    const useMaxNamesForFile = useMaxNames && extension !== '.css';
    const href = getHrefWithoutHost(
      replaceCDNURLPath(url, pathnames, extension, useMaxNamesForFile)
    );
    return hostName + href;
  });
}

/**
 * @param {string} mode
 * @param {string} html
 * @param {string=} hostName
 * @return {string}
 */
function replaceUrls(mode, html, hostName = '') {
  // If you need to add URL mapping logic, please don't do it in this function.
  // Instead, do so in the `cdn.ts` module required by `replaceCdnJsUrls()`

  const useMaxNames = mode !== 'compiled';
  if (!useMaxNames) {
    // TODO(alanorozco): This should be handled in new-server as well.
    html = html.replace(
      /\/dist.3p\/current\/(.*)\.max.html/g,
      hostName + '/dist.3p/current-min/$1.html'
    );
  }
  return replaceCdnJsUrls(mode, html, hostName, useMaxNames);
}

module.exports = {
  getServeMode,
  isRtvMode,
  logServeMode,
  replaceUrls,
  setServeMode,
  toInaboxDocument,
};
