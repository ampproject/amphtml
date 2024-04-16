/**
 * In practice this would be *.ampproject.org and the publishers
 * origin. Please see AMP CORS docs for more details:
 *    https://goo.gl/F6uCAY
 * @type {RegExp}
 */
const ORIGIN_REGEX = new RegExp(
  '^https?://localhost:8000|^https?://.+\\.localhost:8000'
);

/**
 * @param {*} req require('express').Request
 * @param {*} res require('express').Response
 * @param {['POST'|'GET']} opt_validMethods
 * @param {string[]=} opt_exposeHeaders
 */
function assertCors(req, res, opt_validMethods, opt_exposeHeaders) {
  // Allow disable CORS check (iframe fixtures have origin 'about:srcdoc').
  if (req.query.cors == '0') {
    return;
  }

  const validMethods = opt_validMethods || ['GET', 'POST', 'OPTIONS'];
  const invalidMethod = req.method + ' method is not allowed. Use POST.';
  const invalidOrigin = 'Origin header is invalid.';
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
      res.statusCode = 403;
      res.end(JSON.stringify({message: invalidOrigin}));
      throw invalidOrigin;
    }
  } else if (req.headers['amp-same-origin'] == 'true') {
    origin = getUrlPrefix(req);
  } else {
    res.statusCode = 403;
    res.end(JSON.stringify({message: unauthorized}));
    throw unauthorized;
  }

  enableCors(req, res, origin, opt_exposeHeaders);
}

/**
 * @param {*} req require('express').Request
 * @param {*} res require('express').Response
 * @param {string=} origin
 * @param {string[]=} opt_exposeHeaders
 */
function enableCors(req, res, origin, opt_exposeHeaders) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (!origin && req.headers.origin) {
    origin = req.headers.origin;
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader(
    'Access-Control-Expose-Headers',
    (opt_exposeHeaders || []).join(', ')
  );
}

/**
 * @param {*} req require('express').Request
 * @return {string}
 */
function getUrlPrefix(req) {
  return req.protocol + '://' + req.headers.host;
}

module.exports = {
  enableCors,
  assertCors,
};
