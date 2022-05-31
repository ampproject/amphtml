const fs = require('fs');
const {urlToCachePath} = require('./helpers');

const AD_SERVER_DOMAIN = 'securepubads.g.doubleclick.net';
const EXAMPLE_AD_URL =
  'http://localhost:8000/test/fixtures/performance/amp-ad/amphtml-ad.html';

/**
 * Handler that will intercept ads requests and return a locally cached ad
 * instead.
 * @param {!Array<function>} handlersList
 * @param {string} version
 */
function setupAdRequestHandler(handlersList, version) {
  handlersList.push((interceptedRequest) => {
    const url = interceptedRequest.url();
    // TODO(ccordry): allow dynamic ad response.
    if (url.includes(AD_SERVER_DOMAIN)) {
      const path = urlToCachePath(EXAMPLE_AD_URL, version);
      const body = fs.readFileSync(path);
      interceptedRequest.respond({
        status: 200,
        contentType: 'text/html; charset=UTF-8',
        body,
      });
      return true;
    }
    return false;
  });
}

module.exports = {
  setupAdRequestHandler,
};
