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

const esbuild = require('esbuild');
const minimist = require('minimist');
const {cyan, green} = require('../common/colors');
const {log, logLocalDev} = require('../common/logging');
const {relative} = require('path');
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

const tsModule = Object.create(null);

/**
 * @param {function():void} cb
 * @return {number}
 */
function runTimedMs(cb) {
  const time = process.hrtime();
  cb();
  const elapsedTime = process.hrtime(time);
  const NS_PER_SEC = 1e9;
  const MS_PER_NS = 1e-6;
  return (elapsedTime[0] * NS_PER_SEC + elapsedTime[1]) * MS_PER_NS;
}

/**
 * @param {string} path
 * @return {*}
 */
function requireTsSync(path) {
  if (!tsModule[path]) {
    const outfile = `build/${path.replace(/\//g, '--')}.js`;
    const elapsedTimeMs = runTimedMs(() =>
      esbuild.buildSync({
        entryPoints: [path],
        format: 'cjs',
        write: true,
        outfile,
      })
    );
    tsModule[path] = require(`${relative(
      __dirname,
      process.cwd()
    )}/${outfile}`);
    logLocalDev('Built', cyan(path), `(${elapsedTimeMs.toFixed(0)}ms)`);
  }
  return tsModule[path];
}

/**
 * @param {string} mode
 * @param {string} file
 * @param {string=} hostName
 * @param {boolean=} inabox
 * @return {string}
 */
function replaceUrls(mode, file, hostName, inabox) {
  // If you need to add URL mapping logic, please don't do it in this function.
  // Instead, do so in the `cdn.ts` module built below.

  const cdnUrl =
    /** @type {import('./new-server/transforms/utilities/cdn')} */ (
      requireTsSync(
        'build-system/server/new-server/transforms/utilities/cdn.ts'
      )
    );

  // All inabox documents use `amp4ads-v0.js`. Its URL may be rewritten later.
  if (inabox) {
    file = file.replace(
      /(https:\/\/cdn\.ampproject\.org)\/v0\.(m?js)/g,
      '$1/amp4ads-v0.$2'
    );
  }

  hostName = hostName || '';

  const pathnames = undefined; // we don't override the mapping, optional arg
  const isRtv = isRtvMode(mode);

  file = file.replace(
    /https:\/\/cdn\.ampproject\.org\/[^'">]+(\.m?js)/g,
    (urlString, extension) => {
      // TODO(alanorozco): Match --esm in output extension and/or allow
      // `.mjs` to be lazily built regardless of --esm
      const url = new URL(urlString);
      if (isRtv) {
        return cdnUrl.CDNURLToRTVURL(url, mode, pathnames, extension).href;
      }
      const useMaxNames = mode !== 'compiled';
      const {host, href, protocol} = cdnUrl.replaceCDNURLPath(
        url,
        pathnames,
        extension,
        useMaxNames
      );
      return hostName + href.substr(`${protocol}//${host}`.length);
    }
  );

  // TODO(alanorozco): is this still useful?
  if (mode == 'compiled') {
    file = file.replace(
      /\/dist.3p\/current\/(.*)\.max.html/g,
      hostName + '/dist.3p/current-min/$1.html'
    );
  }

  return file;
}

module.exports = {
  getServeMode,
  isRtvMode,
  logServeMode,
  replaceUrls,
  setServeMode,
};
