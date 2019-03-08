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

/**
 * In practice this would be *.ampproject.org and the publishers
 * origin. Please see AMP CORS docs for more details:
 *    https://goo.gl/F6uCAY
 * @type {RegExp}
 */
const ORIGIN_REGEX = new RegExp('^http://localhost:8000|' +
'^http://.+\.localhost:8000|' +
'^https?://.+\.herokuapp\.com');

/**
* In practice this would be the publishers origin.
* Please see AMP CORS docs for more details:
*    https://goo.gl/F6uCAY
* @type {RegExp}
*/
const SOURCE_ORIGIN_REGEX = new RegExp('^http://localhost:8000|' +
'^http://.+\.localhost:8000|' +
'^https?://.+\.herokuapp\.com');

function assertCors(req, res, opt_validMethods, opt_exposeHeaders,
  opt_ignoreMissingSourceOrigin) {
  // Allow disable CORS check (iframe fixtures have origin 'about:srcdoc').
  if (req.query.cors == '0') {
    return;
  }

  const validMethods = opt_validMethods || ['GET', 'POST', 'OPTIONS'];
  const invalidMethod = req.method + ' method is not allowed. Use POST.';
  const invalidOrigin = 'Origin header is invalid.';
  const invalidSourceOrigin = '__amp_source_origin parameter is invalid.';
  const unauthorized = 'Unauthorized Request';
  let origin;

  if (validMethods.indexOf(req.method) == -1) {
    res.statusCode = 405;
    res.end(JSON.stringify({message: invalidMethod}));
    throw invalidMethod;
  }

  if (req.headers.origin) {
    origin = req.headers.origin;
    if (!ORIGIN_REGEX.test(req.headers.origin)) {
      res.statusCode = 500;
      res.end(JSON.stringify({message: invalidOrigin}));
      throw invalidOrigin;
    }

    if (!opt_ignoreMissingSourceOrigin &&
        !SOURCE_ORIGIN_REGEX.test(req.query.__amp_source_origin)) {
      res.statusCode = 500;
      res.end(JSON.stringify({message: invalidSourceOrigin}));
      throw invalidSourceOrigin;
    }
  } else if (req.headers['amp-same-origin'] == 'true') {
    origin = getUrlPrefix(req);
  } else {
    res.statusCode = 401;
    res.end(JSON.stringify({message: unauthorized}));
    throw unauthorized;
  }

  enableCors(req, res, origin, opt_exposeHeaders);
}

function enableCors(req, res, origin, opt_exposeHeaders) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (!origin && req.headers.origin) {
    origin = req.headers.origin;
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Expose-Headers',
      ['AMP-Access-Control-Allow-Source-Origin']
          .concat(opt_exposeHeaders || []).join(', '));
  if (req.query.__amp_source_origin) {
    res.setHeader('AMP-Access-Control-Allow-Source-Origin',
        req.query.__amp_source_origin);
  }
}

function getUrlPrefix(req) {
  return req.protocol + '://' + req.headers.host;
}

module.exports = {
  enableCors, assertCors,
};
