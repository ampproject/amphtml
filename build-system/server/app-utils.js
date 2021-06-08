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
const {log} = require('../common/logging');
const {relative} = require('path');

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

let cdnModule;
const cdnModuleSourcePath =
  'build-system/server/new-server/transforms/utilities/cdn.ts';
const cdnModulePath = 'dist/server-cdn.js';

/**
 * @param {string} mode
 * @param {string} file
 * @param {string=} hostName
 * @param {boolean=} inabox
 * @return {string}
 */
const replaceUrls = (mode, file, hostName, inabox) => {
  if (!cdnModule) {
    esbuild.buildSync({
      entryPoints: [cdnModuleSourcePath],
      format: 'cjs',
      write: true,
      outfile: cdnModulePath,
    });
    cdnModule = require(`${relative(
      __dirname,
      process.cwd()
    )}/${cdnModulePath}`);
  }

  // All inabox documents use `amp4ads-v0.js`, which optionally gets mapped to
  // a local URL later.
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
    /https:\/\/cdn\.ampproject\.org\/.+\.(m?js)/g,
    (match, extension) => {
      // TODO(alanorozco): Match --esm in output extension and/or allow
      // `.mjs` to be lazily built regardless of --esm

      const url = new URL(match);
      if (isRtv) {
        return cdnModule.CDNURLToRTVURL(url, mode, pathnames, extension);
      }

      const useMaxNames = mode === 'default';
      const replacedUrl = cdnModule.replaceCDNURLPath(
        url,
        pathnames,
        extension,
        useMaxNames
      );

      return (
        hostName +
        replacedUrl.href.substr(
          `${replacedUrl.protocol}//${replacedUrl.host}`.length
        )
      );
    }
  );

  // TODO(alanorozco): is this still useful?
  if (mode == 'compiled') {
    file = file.replace(
      /\/dist\/v0\/examples\/(.*)\.max\.(m?js)/g,
      '/dist/v0/examples/$1.$2'
    );
    file = file.replace(
      /\/dist.3p\/current\/(.*)\.max.html/g,
      hostName + '/dist.3p/current-min/$1.html'
    );
  }

  return file;
};

module.exports = {
  getServeMode,
  isRtvMode,
  logServeMode,
  replaceUrls,
  setServeMode,
};
