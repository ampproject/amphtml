/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const escape = require('regexp.escape');
const pumpify = require('pumpify');
const replace = require('gulp-regexp-sourcemaps');

/* eslint-disable */
const POLYMER_BSD_FULL = [
'This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt',
'The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt',
'The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt',
'Code distributed by Google as part of the polymer project is also',
'subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt',
].join('\n ');

const BSD_SHORT = [
'Use of this source code is governed by a BSD-style',
'license that can be found in the LICENSE file or at',
'https://developers.google.com/open-source/licenses/bsd',
].join('\n ');

/* eslint-enable */

const LICENSES = [[POLYMER_BSD_FULL, BSD_SHORT]];

const PATHS = ['third_party/webcomponentsjs/ShadowCSS.js'];

/**
 * We can replace full-text of standard licenses with a pre-approved shorten
 * version.
 * @return {!Pumpify}
 */
exports.shortenLicense = function() {
  const streams = LICENSES.map(tuple => {
    const regex = new RegExp(escape(tuple[0]), 'g');
    return replace(regex, tuple[1], 'shorten-license');
  });

  // Pumpify requires at least 2 streams
  if (streams.length === 1) {
    return streams[0];
  }
  return pumpify.obj(streams);
};

/**
 * Returns true if a source file has a license that needs to be shortened.
 * @param {!Vinyl} file
 * @return {boolean}
 */
exports.shouldShortenLicense = function(file) {
  return PATHS.some(path => file.path.endsWith(path));
};
