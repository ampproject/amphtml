'use strict';

const basepathMappings = require('./basepath-mappings');
const fs = require('fs');
const path = require('path');
const {formatBasepath, getListing} = require('./util/listing');
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
    htmlEnvelopePrefix: '/',
    basepath: formatBasepath(mappedPath),
    serveMode: getServeMode(),
    css,
  });

  res.end(renderedHtml);

  return renderedHtml; // for testing
}

/**
 * @param {*} app require('express')
 */
function installExpressMiddleware(app) {
  app.get(['/', '/*'], serveIndex);
}

module.exports = {
  installExpressMiddleware,

  // To be tested but not be exported for use.
  serveIndexForTesting: serveIndex,
};
