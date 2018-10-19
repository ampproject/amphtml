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


const BBPromise = require('bluebird');
const bundler = require('./bundler');
const fs = BBPromise.promisifyAll(require('fs'));
const {join, normalize, sep} = require('path');

// HTML Templates
const templateFile = join(__dirname, '/template.html');

// JS Component
const mainComponent = join(__dirname, '/components/main.js');

// CSS
const mainCssFile = join(__dirname, '/main.css');


function getListing(basepath) {
  // currently sitting on build-system/app-index, so we go back two dirs for the
  // repo root.
  const rootPath = join(__dirname, '../../');

  // join / normalize from root dir
  const path = normalize(join(rootPath, basepath));

  // null byte(s), bad request
  if (~path.indexOf('\0')) {
    return Promise.resolve(null);
  }

  // malicious path
  if ((path + sep).substr(0, rootPath.length) !== rootPath) {
    return Promise.resolve(null);
  }

  return fs.statAsync(path).then(stat =>
    !stat.isDirectory() ? null : fs.readdirAsync(path))
      .catch(() => /* empty catch for fallbacks */ null);
}


let shouldCache = true;
function setCacheStatus(cacheStatus) {
  shouldCache = cacheStatus;
}


let mainBundleCache;
async function bundleMain() {
  if (shouldCache && mainBundleCache) {
    return mainBundleCache;
  }
  const bundle = await bundler.bundleComponent(mainComponent);
  if (shouldCache) {
    mainBundleCache = bundle;
  }
  return bundle;
}


function getListingPath(url) {
  if (url == '/') {
    return '/examples';
  }
  if (url == '/~') {
    return '/';
  }
  return url;
}


function isMainPageFromUrl(url) {
  return url == '/';
}

function serveIndex(req, res, next) {
  const isMainPage = isMainPageFromUrl(req.url);
  const basepath = getListingPath(req.url);

  return (async() => {
    const fileSet = await getListing(basepath);

    if (fileSet == null) {
      next();
      return;
    }

    const bundle = await bundleMain();
    const template = (await fs.readFileSync(templateFile)).toString();
    const css = (await fs.readFileSync(mainCssFile)).toString();

    const initialState = {
      basepath,
      fileSet,
      isMainPage,
    };

    const renderedHtml = template
        .replace('<!-- bundle -->', bundle)
        .replace('<!-- main_style -->', css)
        .replace('<!-- initial_state_json -->', JSON.stringify(initialState));

    res.end(renderedHtml);
  })();
}

module.exports = {
  setCacheStatus,
  serveIndex,
};
