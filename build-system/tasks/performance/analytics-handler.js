/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

function setupAnalyticsHandler(handlersList, handlerOptions, resolve) {
  const {extraUrlParam} = handlerOptions;
  const analyticsParam = Object.keys(extraUrlParam)
    .map((key) => `${key}=${extraUrlParam[key]}`)
    .join('&');

  handlerOptions['startTime'] = Date.now();
  handlerOptions['requests'] = [];
  let requestsSeen = 0;

  handlersList.push((interceptedRequest) =>
    maybeHandleAnalyticsRequest(
      interceptedRequest,
      analyticsParam,
      // This cb function is called iff the intercepted request has the magic
      // analytics param. Optionally analytics requests can contain a
      // `requestName` and `totalRequests` param if we want to measure more
      // than one request per page.
      (time, optRequestName, optExpectedRequests) => {
        requestsSeen++;

        // Store the first request delay. May be the only metric we have on
        // live pages.
        if (!handlerOptions['firstRequestTime']) {
          handlerOptions['firstRequestTime'] = time;
        }

        // Sample pages can indicate the total number of expected requests.
        // Will not be on real pages.
        if (
          optExpectedRequests &&
          !isNaN(parseInt(optExpectedRequests, 10)) &&
          !handlerOptions['expectedRequests']
        ) {
          handlerOptions['expectedRequests'] = parseInt(
            optExpectedRequests,
            10
          );
        }

        // Named request in sample page. Will not be named on real pages.
        const requestName = optRequestName || `request${requestsSeen}`;
        handlerOptions.requests.push({requestName, time});

        if (
          !handlerOptions['expectedRequests'] ||
          requestsSeen >= handlerOptions['expectedRequests']
        ) {
          // Resolve and short circuit setTimeout
          resolve();
        }
      }
    )
  );
}

/**
 * Matches intercepted request with special analytics parameter
 * and records first outgoing analytics request, using callback.
 * Abort all requests, to not ping real servers.
 * @param {Request} interceptedRequest
 * @param {string} analyticsParam
 * @param {!Function} requestCallback
 * @return {!Promise<boolean>}
 */
async function maybeHandleAnalyticsRequest(
  interceptedRequest,
  analyticsParam,
  requestCallback
) {
  const interceptedUrl = interceptedRequest.url();
  if (interceptedUrl.includes(analyticsParam)) {
    const {searchParams} = new URL(interceptedUrl);
    // Magic parameter name to name request.
    const requestName = searchParams.get('requestName');
    // Magic parameter name to indicate total requests expected.
    const expectedRequests = searchParams.get('expectedRequests');

    requestCallback(Date.now(), requestName, expectedRequests);

    interceptedRequest.abort();
    return true;
  }
  return false;
}

/**
 * If request didn't fire, don't include any value for
 * analyticsRequest.
 *
 * @param {?Object} analyticsHandlerOptions
 * @return {!Object}
 */
function getAnalyticsMetrics(analyticsHandlerOptions) {
  const {
    expectedRequests,
    firstRequestTime,
    requests,
    startTime,
  } = analyticsHandlerOptions;
  const analyticsMetrics = {};
  // If there is no firstRequestTime, that means that request didn't fire.
  // `percentRequestsFailed` because we take the mean rather than sum
  analyticsMetrics['percentRequestsFailed'] = firstRequestTime ? 0 : 1;

  // We only optionally track more than one request.
  if (!expectedRequests) {
    analyticsMetrics['firstRequestTime'] = firstRequestTime - startTime;
    return analyticsMetrics;
  }

  // Page has opted into tracking more than 1 request.
  requests.forEach(
    ({requestName, time}) => (analyticsMetrics[requestName] = time - startTime)
  );

  return analyticsMetrics;
}

module.exports = {
  getAnalyticsMetrics,
  setupAnalyticsHandler,
};
