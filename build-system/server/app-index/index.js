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

const api = require('./api/api');
const basepathMappings = require('./basepath-mappings');
const fs = require('fs');
const path = require('path');
const {
  getListing,
  isMainPageFromUrl,
  formatBasepath,
} = require('./util/listing');
const {getServeMode} = require('../app-utils');
const {join} = require('path');
const {renderTemplate} = require('./template');

// Sitting on /build-system/server/app-index, so we go back thrice for the repo root.
const root = path.join(__dirname, '../../../');

// CSS
const mainCssFile = join(__dirname, '/main.css');

/**
 * @param {*} param0 require(express).Request
 * @param {*} res require(express).Response
 * @param {*=} next require(express).NextFunction
 * @return {Promise<string|undefined>}
 */
async function serveIndex({url}, res, next) {
  const mappedPath = basepathMappings[url] || url;
  const fileSet = await getListing(root, mappedPath);

  if (fileSet == null) {
    return next();
  }

  const css = fs.readFileSync(mainCssFile).toString();

  const renderedHtml = renderTemplate({
    fileSet,
    selectModePrefix: '/',
    isMainPage: isMainPageFromUrl(url),
    basepath: formatBasepath(mappedPath),
    serveMode: getServeMode(),
    css,
  });

  res.end(renderedHtml);

  return renderedHtml; // for testing
}

/**
 * @param {*} app require('express')
 * @return {void}
 */
function installExpressMiddleware(app) {
  api.installExpressMiddleware(app);

  app.get(['/', '/*'], serveIndex);
}

module.exports = {
  installExpressMiddleware,

  // To be tested but not be exported for use.
  serveIndexForTesting: serveIndex,
};
