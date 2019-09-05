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

/**
 * Determines the server's mode based on command line arguments.
 * @return {string}
 */
function getServeMode() {
  const argv = minimist(process.argv.slice(2), {string: ['rtv']});
  if (argv.compiled) {
    return 'compiled';
  }
  if (argv.cdn) {
    return 'cdn';
  }
  if (argv.rtv != undefined) {
    const {rtv} = argv;
    if (isRtvMode(rtv)) {
      return 'rtv';
    } else {
      const err = new Error(`Invalid rtv: ${rtv}. (Must be 15 digits long.)`);
      err.showStack = false;
      throw err;
    }
  }
  return 'default';
}

/**
 * @param {string} serveMode
 * @return {boolean}
 */
const isRtvMode = serveMode => {
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
      /https:\/\/cdn\.ampproject\.org\/v0\.js/g,
      hostName + '/dist/v0.js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/shadow-v0\.js/g,
      hostName + '/dist/shadow-v0.js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/amp4ads-v0\.js/g,
      hostName + '/dist/amp4ads-v0.js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/video-iframe-integration-v0\.js/g,
      hostName + '/dist/video-iframe-integration-v0.js'
    );
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/v0\/(.+?).js/g,
      hostName + '/dist/v0/$1.js'
    );
    file = file.replace(
      /\/dist\/v0\/examples\/(.*)\.max.js/g,
      '/dist/v0/examples/$1.js'
    );
    file = file.replace(
      /\/dist.3p\/current\/(.*)\.max.html/g,
      hostName + '/dist.3p/current-min/$1.html'
    );

    if (inabox) {
      file = file.replace(/\/dist\/v0\.js/g, '/dist/amp4ads-v0.js');
    }
  } else if (isRtvMode(mode)) {
    hostName = `https://cdn.ampproject.org/rtv/${mode}/`;
    file = file.replace(/https:\/\/cdn\.ampproject\.org\//g, hostName);

    if (inabox) {
      file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/rtv\/\d{15}\/v0\.js/g,
        hostName + 'amp4ads-v0.js'
      );
    }
  } else if (inabox) {
    file = file.replace(
      /https:\/\/cdn\.ampproject\.org\/v0\.js/g,
      'https://cdn.ampproject.org/amp4ads-v0.js'
    );
  }
  return file;
};

module.exports = {
  isRtvMode,
  replaceUrls,
  getServeMode,
};
