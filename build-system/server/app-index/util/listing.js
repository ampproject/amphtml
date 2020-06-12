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
'use strict';

const fs = require('fs');
const {join, normalize, sep} = require('path');

function isMaliciousPath(path, rootPath) {
  return (path + sep).substr(0, rootPath.length) !== rootPath;
}

async function getListing(rootPath, basepath) {
  const path = normalize(join(rootPath, basepath));

  if (~path.indexOf('\0')) {
    return null;
  }

  if (isMaliciousPath(path, rootPath)) {
    return null;
  }

  try {
    if (fs.statSync(path).isDirectory()) {
      return fs.promises.readdir(path);
    }
  } catch (unusedE) {
    /* empty catch for fallbacks */
    return null;
  }
}

function isMainPageFromUrl(url) {
  return url == '/';
}

/**
 * Adds a trailing slash if missing.
 * @param {string} basepath
 * @return {string}
 */
function formatBasepath(basepath) {
  return basepath.replace(/[^\/]$/, (lastChar) => `${lastChar}/`);
}

module.exports = {
  isMaliciousPath,
  getListing,
  isMainPageFromUrl,
  formatBasepath,
};
