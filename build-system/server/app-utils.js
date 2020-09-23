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

const log = require('fancy-log');
const minimist = require('minimist');
const {cyan, green} = require('ansi-colors');

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
      const err = new Error(`Invalid rtv: ${rtv}. (Must be 15 digits long.)`);
      err.showStack = false;
      throw err;
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
 * @param {string} mode
 * @param {string} file
 * @param {string=} hostName
 * @param {boolean=} inabox
 * @param {boolean=} storyV1
 * @return {string}
 */
const replaceUrls = (mode, file, hostName, inabox, storyV1) => {
  hostName = hostName || '';
  if (mode == 'default') {
    // TODO:(ccordry) remove this when story 0.1 is deprecated
    if (storyV1) {
      file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/v0\/amp-story-0\.1\.js/g,
        hostName + '/dist/v0/amp-story-1.0.max.js'
      );
    }
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/v0\.js/g,
      hostName + '/dist/amp.js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/shadow-v0\.js/g,
      hostName + '/dist/amp-shadow.js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/amp4ads-v0\.js/g,
      hostName + '/dist/amp-inabox.js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/video-iframe-integration-v0\.js/g,
      hostName + '/dist/video-iframe-integration.js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/v0\/(.+?).js/g,
      hostName + '/dist/v0/$1.max.js'
    );
    if (inabox) {
      const filename = '/dist/amp-inabox.js';
      file = file.replace(/<html [^>]*>/, '<html amp4ads>');
      file = file.replace(/\/dist\/amp\.js/g, filename);
    }
  } else if (mode == 'compiled') {
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/v0\.(m?)js/g,
      hostName + '/dist/v0.$1js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/shadow-v0\.(m?)js/g,
      hostName + '/dist/shadow-v0.$1js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/amp4ads-v0\.(m?)js/g,
      hostName + '/dist/amp4ads-v0.$1js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/video-iframe-integration-v0\.(m?)js/g,
      hostName + '/dist/video-iframe-integration-v0.$1js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/v0\/(.+?).(m?)js/g,
      hostName + '/dist/v0/$1.$2js'
    );
    file = file.replace(
      /\/dist\/v0\/examples\/(.*)\.max.(m?)js/g,
      '/dist/v0/examples/$1.$2js'
    );
    file = file.replace(
      /\/dist.3p\/current\/(.*)\.max.html/g,
      hostName + '/dist.3p/current-min/$1.html'
    );

    if (inabox) {
      file = file.replace(/\/dist\/v0\.(m?)js/g, '/dist/amp4ads-v0.$1js');
    }
  } else if (isRtvMode(mode)) {
    hostName = `https://cdn.ampproject.org/rtv/${mode}/`;
    file = file.replace(/https:\/\/cdn\.ampproject\.org\//g, hostName);

    if (inabox) {
      file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/rtv\/\d{15}\/v0\.(m?)js/g,
        hostName + 'amp4ads-v0.$1js'
      );
    }
  } else if (inabox) {
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/v0\.(m?)js/g,
      'https://cdn.ampproject.org/amp4ads-v0.$1js'
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
