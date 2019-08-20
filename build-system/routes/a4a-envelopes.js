/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const app = require('express').Router();
const BBPromise = require('bluebird');
const fs = BBPromise.promisifyAll(require('fs'));
const request = require('request');
const {replaceUrls} = require('../app-utils');
const {SERVE_MODE} = process.env;

// In-a-box envelope.
// Examples:
// http://localhost:8000/inabox/examples/animations.amp.html
// http://localhost:8000/inabox/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/inabox/', (req, res) => {
  let adUrl = req.url;
  const templatePath = '/build-system/server-inabox-template.html';
  const urlPrefix = getUrlPrefix(req);
  if (
    !adUrl.startsWith('/proxy') && // Ignore /proxy
    urlPrefix.includes('//localhost')
  ) {
    // This is a special case for testing. `localhost` URLs are transformed to
    // `ads.localhost` to ensure that the iframe is fully x-origin.
    adUrl = urlPrefix.replace('localhost', 'ads.localhost') + adUrl;
  }
  adUrl = addQueryParam(adUrl, 'inabox', 1);
  if (req.query.log) {
    adUrl += '#log=' + req.query.log;
  }
  fs.readFileAsync(process.cwd() + templatePath, 'utf8').then(template => {
    template = template.replace(/SOURCE/g, 'AD_URL');
    res.end(fillTemplate(template, adUrl, req.query));
  });
});

// In-a-box friendly iframe and safeframe envelope.
// Examples:
// http://localhost:8000/inabox-friendly/examples/animations.amp.html
// http://localhost:8000/inabox-friendly/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/inabox-(friendly|safeframe)', (req, res) => {
  let adUrl = req.url;
  const urlPrefix = getUrlPrefix(req).replace('localhost', 'ads.localhost');
  const templatePath = '/build-system/server-inabox-template.html';
  adUrl = addQueryParam(adUrl, 'inabox', 1);
  if (req.query.log) {
    adUrl += '#log=' + req.query.log;
  }
  fs.readFileAsync(process.cwd() + templatePath, 'utf8')
    .then(template => {
      if (req.baseUrl == '/inabox-friendly') {
        template = template.replace('SRCDOC_ATTRIBUTE', 'srcdoc="BODY"');
      } else {
        template = template
          .replace(
            /NAME/g,
            '1-0-31;LENGTH;BODY{&quot;uid&quot;:&quot;test&quot;}'
          )
          .replace(
            /SOURCE/g,
            urlPrefix + '/test/fixtures/served/iframe-safeframe.html'
          );
      }
      return requestFromUrl(template, urlPrefix + adUrl, req.query);
    })
    .then(result => {
      if (result) {
        res.end(result);
      } else {
        res.redirect(adUrl);
      }
    });
});

// A4A envelope.
// Examples:
// http://localhost:8000/a4a[-3p]/examples/animations.amp.html
// http://localhost:8000/a4a[-3p]/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/a4a(|-3p)/', (req, res) => {
  const force3p = req.baseUrl.startsWith('/a4a-3p');
  let adUrl = req.url;
  const templatePath = '/build-system/server-a4a-template.html';
  const urlPrefix = getUrlPrefix(req);
  if (!adUrl.startsWith('/proxy') && urlPrefix.includes('//localhost')) {
    // This is a special case for testing. `localhost` URLs are transformed to
    // `ads.localhost` to ensure that the iframe is fully x-origin.
    adUrl = urlPrefix.replace('localhost', 'ads.localhost') + adUrl;
  }
  adUrl = addQueryParam(adUrl, 'inabox', 1);
  fs.readFileAsync(process.cwd() + templatePath, 'utf8').then(template => {
    const content = fillTemplate(template, adUrl, req.query)
      .replace(/CHECKSIG/g, force3p || '')
      .replace(/DISABLE3PFALLBACK/g, !force3p);
    res.end(replaceUrls(SERVE_MODE, content));
  });
});

function getUrlPrefix(req) {
  return req.protocol + '://' + req.headers.host;
}

/**
 * @param {string} url
 * @param {string} param
 * @param {*} value
 * @return {string}
 */
function addQueryParam(url, param, value) {
  const paramValue =
    encodeURIComponent(param) + '=' + encodeURIComponent(value);
  if (!url.includes('?')) {
    url += '?' + paramValue;
  } else {
    url += '&' + paramValue;
  }
  return url;
}

/**
 * Fetch a page from the target URL and fill its content into the template.
 * If the URL does not return text, returns null.
 * @param {string} template
 * @param {string} url
 * @param {Object} query
 * @return {!Promise<?string>}
 */
function requestFromUrl(template, url, query) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      }
      if (
        !response.headers['content-type'] ||
        response.headers['content-type'].startsWith('text/html')
      ) {
        resolve(fillTemplate(template, url, query, body));
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Fill out a template with some common variables.
 * @param {string} template
 * @param {string} url
 * @param {Object} query
 * @param {?string} body
 * @return {string}
 */
function fillTemplate(template, url, query, body) {
  let newBody;
  let length;
  if (body) {
    newBody = body
      .replace(/&/g, '&amp;')
      .replace(/'/g, '&apos;')
      .replace(/"/g, '&quot;');
    length = body.length;
  } else {
    length = 0;
  }
  return (
    template
      .replace(/BODY/g, newBody)
      .replace(/LENGTH/g, length)
      .replace(/AD_URL/g, url)
      .replace(/OFFSET/g, query.offset || '0px')
      .replace(/AD_WIDTH/g, query.width || '300')
      .replace(/AD_HEIGHT/g, query.height || '250')
      // Clear out variables that are not already replaced beforehand.
      .replace(/NAME/g, 'inabox')
      .replace(/SOURCE/g, '')
      .replace('SRCDOC_ATTRIBUTE', '')
  );
}

module.exports = app;
