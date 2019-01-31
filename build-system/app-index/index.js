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
const {
  getListing,
  isMainPageFromUrl,
  formatBasepath,
} = require('./util/listing');
const {handleApiRequest} = require('./api/api');
const {join} = require('path');
const {renderTemplate} = require('./template');

const pc = process;

// JS Component
const mainComponent = join(__dirname, '/components/main.js');

// CSS
const mainCssFile = join(__dirname, '/main.css');

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

function serveIndex({root, mapBasepath}) {
  const mapBasepathOrPassthru = mapBasepath || (url => url);

  return (req, res, next) => {
    if (!root) {
      res.status(500);
      res.end('Misconfigured: missing `root`.');
      return;
    }

    return (async() => {

      if (req.path.startsWith('/dashboard/api')) {
        handleApiRequest(root, req, res, next);
        return;
      }

      const isMainPage = isMainPageFromUrl(req.url);
      const basepath = mapBasepathOrPassthru(req.url);

      const fileSet = await getListing(root, basepath);

      if (fileSet == null) {
        next();
        return;
      }

      const css = (await fs.readFileAsync(mainCssFile)).toString();

      const serveMode = pc.env.SERVE_MODE || 'default';

      const renderedHtml = renderTemplate({
        basepath: formatBasepath(basepath),
        fileSet,
        isMainPage,
        serveMode,
        css,
        selectModePrefix: '/',
      });

      res.end(renderedHtml);

      return renderedHtml; // for testing
    })();
  };
}

// Promises to run before serving
async function beforeServeTasks() {
  if (shouldCache) {
    await bundleMain();
  }
}

module.exports = {
  setCacheStatus,
  serveIndex,
  beforeServeTasks,
};
