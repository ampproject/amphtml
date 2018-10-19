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

// TODO(alanorozco): Use JSX once we're ready.
// HTML Templates
const templateFile = join(__dirname, '/template.html');
const proxyFormFile = join(__dirname, '/proxy-form.html');
const listingHeaderFile = join(__dirname, '/listing-header.html');

// JS Component
const proxyFormComponent = join(__dirname, '/components/proxy-form.js');
const mainCssFile = join(__dirname, '/main.css');



function renderFileLink(base, location) {
  return `<li>
    <a class="file-link" href="${base.replace(/\/$/, '')}/${location}"
      data-default="${base.replace(/^\/|\/$/, '')}/${location}">${location}</a>
  </li>`;
}


function renderListing(basepath) {
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

  return fs.statAsync(path).then(stat => {
    if (!stat.isDirectory()) {
      return null;
    }

    return Promise.all([
      fs.readdirAsync(path),
      fs.readFileAsync(templateFile),
      fs.readFileAsync(mainCssFile),
    ]).then(result => {
      const files = result[0];
      const template = result[1].toString();
      const css = result[2].toString();

      return template
          .replace('<!-- main_style -->', `<style>${css}</style>`)
          .replace('<!-- basepath -->', basepath)
          .replace('<!-- listing -->',
              files.map(file => renderFileLink(basepath, file)).join(''));
    });
  }).catch(() => /* empty catch for fallbacks */ null);
}


function serveListingWithReplacements(
  req, res, next, path, replacements = {}) {

  Promise.all(
      [renderListing(path)].concat(
          Object.values(replacements).map(p =>
            fs.readFileAsync(p)))).then(result => {
    let output = result[0];

    if (!output) {
      next();
      return;
    }

    let i = 1;
    Object.keys(replacements).forEach(key => {
      output = output.replace(key, result[i++]);
    });

    res.end(output);
  });
}

let shouldCache = true;
function setCacheStatus(cacheStatus) {
  shouldCache = cacheStatus;
}

let serveIndexCache;
function serveIndex(req, res) {

  if (shouldCache && serveIndexCache) {
    res.end(serveIndexCache);
    return;
  }

  const serveIndexTask = async() => {
    const bundle = await bundler.bundleComponent(proxyFormComponent);
    let renderedHtml = await renderListing('/examples');

    renderedHtml = renderedHtml.replace(
        '<!-- bottom_of_header -->',
        fs.readFileSync(proxyFormFile, 'utf8').toString()
    );
    renderedHtml = renderedHtml.replace(
        '<!-- bundle -->',
        bundle
    );

    if (shouldCache) {
      serveIndexCache = renderedHtml;
    }
    res.end(renderedHtml);
    return renderedHtml;
  };
  return serveIndexTask();
}


function serveListing(req, res, next) {
  serveListingWithReplacements(req, res, next, req.url.replace(/^\/~/, '/'), {
    '<!-- right_of_logo -->': listingHeaderFile,
  });
}

module.exports = {
  setCacheStatus,
  serveIndex,
  serveListing,
};
