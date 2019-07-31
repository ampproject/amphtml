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
    const result = template
      .replace(/AD_URL/g, adUrl)
      .replace(/OFFSET/g, req.query.offset || '0px')
      .replace(/AD_WIDTH/g, req.query.width || '300')
      .replace(/AD_HEIGHT/g, req.query.height || '250');
    res.end(result);
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
    const result = template
      .replace(/CHECKSIG/g, force3p || '')
      .replace(/DISABLE3PFALLBACK/g, !force3p)
      .replace(/OFFSET/g, req.query.offset || '0px')
      .replace(/AD_URL/g, adUrl)
      .replace(/AD_WIDTH/g, req.query.width || '300')
      .replace(/AD_HEIGHT/g, req.query.height || '250');
    res.end(result);
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

module.exports = app;
