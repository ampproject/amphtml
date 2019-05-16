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
const MIT_FULL = [
'Permission is hereby granted, free of charge, to any person obtaining a copy',
'of this software and associated documentation files (the "Software"), to deal',
'in the Software without restriction, including without limitation the rights',
'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell',
'copies of the Software, and to permit persons to whom the Software is',
'furnished to do so, subject to the following conditions:',
'',
'The above copyright notice and this permission notice shall be included in',
'all copies or substantial portions of the Software.',
'',
'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,',
'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE',
'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER',
'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,',
'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN',
'THE SOFTWARE.'
].join('\n');

const MIT_SHORT = [
'Use of this source code is governed by a MIT-style',
'license that can be found in the LICENSE file or at',
'https://opensource.org/licenses/MIT.'
].join('\n');

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

const LICENSES = [[MIT_FULL, MIT_SHORT], [POLYMER_BSD_FULL, BSD_SHORT]];

const PATHS = [
  'third_party/webcomponentsjs/ShadowCSS.js',
  'node_modules/document-register-element/build/' +
    'document-register-element.patched.js',
];

/**
 * We can replace full-text of standard licenses with a pre-approved shorten
 * version.
 */
exports.shortenLicense = function() {
  const streams = LICENSES.map(tuple => {
    const regex = new RegExp(escape(tuple[0]), 'g');
    return replace(regex, tuple[1], 'shorten-license');
  });

  return pumpify.obj(streams);
};

/**
 * Returns true if a source file has a license that needs to be shortened.
 * @param {Vinyl} file
 */
exports.shouldShortenLicense = function(file) {
  return PATHS.some(path => file.path.endsWith(path));
};
