import { resolvedPromise as _resolvedPromise5 } from "./core/data-structures/promise";import { resolvedPromise as _resolvedPromise4 } from "./core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./core/data-structures/promise";function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);} /**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import { Deferred } from "./core/data-structures/promise";
import { parseQueryString } from "./core/types/string/url";
import { WindowInterface } from "./core/window/interface";
import { isExperimentOn } from "./experiments";
import { dev, user, userAssert } from "./log";
import { getMode } from "./mode";
import { Services } from "./service";
import { addParamsToUrl, isProxyOrigin, parseUrlDeprecated } from "./url";

var TIMEOUT_VALUE = 8000;

var trackImpressionPromise = null;

var DEFAULT_APPEND_URL_PARAM = ['gclid', 'gclsrc'];

/**
 * These domains are trusted with more sensitive viewer operations such as
 * sending impression requests. If you believe your domain should be here,
 * file the issue on GitHub to discuss. The process will be similar
 * (but somewhat more stringent) to the one described in the [3p/README.md](
 * https://github.com/ampproject/amphtml/blob/main/3p/README.md)
 *
 * @type {!Array<!RegExp>}
 */
var TRUSTED_REFERRER_HOSTS = [
/**
 * Twitter's link wrapper domains:
 * - t.co
 */
/^t.co$/];


/**
 * A function to get the trackImpressionPromise;
 * @return {!Promise}
 */
export function getTrackImpressionPromise() {
  return userAssert(trackImpressionPromise, 'E#19457 trackImpressionPromise');
}

/**
 * Function that reset the trackImpressionPromise only for testing
 * @visibleForTesting
 */
export function resetTrackImpressionPromiseForTesting() {
  trackImpressionPromise = null;
}

/**
 * Emit a HTTP request to a destination defined on the incoming URL.
 * Launched for trusted viewer. Otherwise guarded by experiment.
 * @param {!Window} win
 */
export function maybeTrackImpression(win) {
  var deferred = new Deferred();
  var promise = deferred.promise,resolveImpression = deferred.resolve;

  trackImpressionPromise = Services.timerFor(win).
  timeoutPromise(TIMEOUT_VALUE, promise, 'TrackImpressionPromise timeout').
  catch(function (error) {
    dev().warn('IMPRESSION', error);
  });

  var viewer = Services.viewerForDoc(win.document.documentElement);
  var isTrustedViewerPromise = viewer.isTrustedViewer();
  var isTrustedReferrerPromise = viewer.
  getReferrerUrl().
  then(function (referrer) {return isTrustedReferrer(referrer);});
  Promise.all([isTrustedViewerPromise, isTrustedReferrerPromise]).then(
  function (results) {
    var isTrustedViewer = results[0];
    var isTrustedReferrer = results[1];
    // Enable the feature in the case of trusted viewer,
    // or trusted referrer
    // or with experiment turned on
    if (
    !isTrustedViewer &&
    !isTrustedReferrer &&
    !isExperimentOn(win, 'alp'))
    {
      resolveImpression();
      return;
    }

    var replaceUrlPromise = handleReplaceUrl(win);
    var clickUrlPromise = handleClickUrl(win);

    Promise.all([replaceUrlPromise, clickUrlPromise]).then(
    function () {
      resolveImpression();
    },
    function () {});

  });

}

/**
 * Signal that impression tracking is not relevant in this environment.
 */
export function doNotTrackImpression() {
  trackImpressionPromise = _resolvedPromise();
}

/**
 * Handle the getReplaceUrl and return a promise when url is replaced Only
 * handles replaceUrl when viewer indicates AMP to do so. Viewer should indicate
 * by setting the legacy replaceUrl init param and add `replaceUrl` to its
 * capability param. Future plan is to change the type of legacy init replaceUrl
 * param from url string to boolean value. Please NOTE replaceUrl and adLocation
 * will never arrive at same time, so there is no race condition on the order of
 * handling url replacement.
 * @param {!Window} win
 * @return {!Promise}
 */
function handleReplaceUrl(win) {
  var viewer = Services.viewerForDoc(win.document.documentElement);

  // ReplaceUrl substitution doesn't have to wait until the document is visible
  if (!viewer.getParam('replaceUrl')) {
    // The init replaceUrl param serve as a signal on whether replaceUrl is
    // required for this doc.
    return _resolvedPromise2();
  }

  if (!viewer.hasCapability('replaceUrl')) {
    // If Viewer is not capability of providing async replaceUrl, use the legacy
    // init replaceUrl param.
    viewer.replaceUrl(viewer.getParam('replaceUrl') || null);
    return _resolvedPromise3();
  }

  // request async replaceUrl is viewer support getReplaceUrl.
  return viewer.
  sendMessageAwaitResponse('getReplaceUrl', /* data */undefined).
  then(
  function (response) {
    if (!response || _typeof(response) != 'object') {
      dev().warn('IMPRESSION', 'get invalid replaceUrl response');
      return;
    }
    viewer.replaceUrl(response['replaceUrl'] || null);
  },
  function (err) {
    dev().warn('IMPRESSION', 'Error request replaceUrl from viewer', err);
  });

}

/**
 * @param {string} referrer
 * @return {boolean}
 * @visibleForTesting
 */
export function isTrustedReferrer(referrer) {
  var url = parseUrlDeprecated(referrer);
  if (url.protocol != 'https:') {
    return false;
  }
  return TRUSTED_REFERRER_HOSTS.some(function (th) {return th.test(url.hostname);});
}

/**
 * Perform the impression request if it has been provided via
 * the click param in the viewer arguments. Returns a promise.
 * @param {!Window} win
 * @return {!Promise}
 */
function handleClickUrl(win) {
  var ampdoc = Services.ampdoc(win.document.documentElement);
  var viewer = Services.viewerForDoc(ampdoc);

  /** @const {?string} */
  var clickUrl = viewer.getParam('click');
  if (!clickUrl) {
    return _resolvedPromise4();
  }

  if (clickUrl.indexOf('https://') != 0) {
    user().warn(
    'IMPRESSION',
    'click fragment param should start with https://. Found ',
    clickUrl);

    return _resolvedPromise5();
  }

  if (WindowInterface.getLocation(win).hash) {
    // This is typically done using replaceState inside the viewer.
    // If for some reason it failed, get rid of the fragment here to
    // avoid duplicate tracking.
    WindowInterface.getLocation(win).hash = '';
  }

  // TODO(@zhouyx) need test with a real response.
  return ampdoc.
  whenFirstVisible().
  then(function () {
    return invoke(win, /** @type {string} */(clickUrl));
  }).
  then(function (response) {
    applyResponse(win, response);
  }).
  catch(function (err) {
    user().warn('IMPRESSION', 'Error on request clickUrl: ', err);
  });
}

/**
 * Send the url to ad server and wait for its response
 * @param {!Window} win
 * @param {string} clickUrl
 * @return {!Promise<?JsonObject>}
 */
function invoke(win, clickUrl) {
  if (false && !false) {
    clickUrl = 'http://localhost:8000/impression-proxy?url=' + clickUrl;
  }
  return Services.xhrFor(win).
  fetchJson(clickUrl, {
    credentials: 'include' }).

  then(function (res) {
    // Treat 204 no content response specially
    if (res.status == 204) {
      return null;
    }
    return res.json();
  });
}

/**
 * parse the response back from ad server
 * Set for analytics purposes
 * @param {!Window} win
 * @param {?JsonObject} response
 */
function applyResponse(win, response) {
  if (!response) {
    return;
  }

  var adLocation = response['location'];
  var adTracking = response['tracking_url'];

  // If there is a tracking_url, need to track it
  // Otherwise track the location
  var trackUrl = adTracking || adLocation;

  if (trackUrl && !isProxyOrigin(trackUrl)) {
    // To request the provided trackUrl for tracking purposes.
    new Image().src = trackUrl;
  }

  // Replace the location href params with new location params we get (if any).
  if (adLocation) {
    if (!win.history.replaceState) {
      return;
    }

    var viewer = Services.viewerForDoc(win.document.documentElement);
    var currentHref = WindowInterface.getLocation(win).href;
    var url = parseUrlDeprecated(adLocation);
    var params = parseQueryString(url.search);
    var newHref = addParamsToUrl(currentHref, params);
    // TODO: Avoid overwriting the fragment parameter.
    win.history.replaceState(null, '', newHref);
    viewer.maybeUpdateFragmentForCct();
  }
}

/**
 * Return a promise that whether appending extra url params to outgoing link is
 * required.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<boolean>}
 */
export function shouldAppendExtraParams(ampdoc) {
  return ampdoc.whenReady().then(function () {
    return !!ampdoc.
    getBody().
    querySelector('amp-analytics[type=googleanalytics]');
  });
}

/**
 * Return the extra url params string that should be appended to outgoing link
 * @param {!Window} win
 * @param {!Element} target
 * @return {string}
 */
export function getExtraParamsUrl(win, target) {
  // Get an array with extra params that needs to append.
  var url = parseUrlDeprecated(WindowInterface.getLocation(win).href);
  var params = parseQueryString(url.search);
  var appendParams = [];
  for (var i = 0; i < DEFAULT_APPEND_URL_PARAM.length; i++) {
    var param = DEFAULT_APPEND_URL_PARAM[i];
    if (typeof params[param] !== 'undefined') {
      appendParams.push(param);
    }
  }

  // Check if the param already exists
  var additionalUrlParams = target.getAttribute('data-amp-addparams');
  var href = target.href;
  if (additionalUrlParams) {
    href = addParamsToUrl(href, parseQueryString(additionalUrlParams));
  }
  var loc = parseUrlDeprecated(href);
  var existParams = parseQueryString(loc.search);
  for (var _i = appendParams.length - 1; _i >= 0; _i--) {
    var _param = appendParams[_i];
    if (typeof existParams[_param] !== 'undefined') {
      appendParams.splice(_i, 1);
    }
  }
  return getQueryParamUrl(appendParams);
}

/**
 * Helper method to convert an query param array to string
 * @param {!Array<string>} params
 * @return {string}
 */
function getQueryParamUrl(params) {
  var url = '';
  for (var i = 0; i < params.length; i++) {
    var param = params[i];
    url +=
    i == 0 ? "".concat(
    param, "=QUERY_PARAM(").concat(param, ")") : "&".concat(
    param, "=QUERY_PARAM(").concat(param, ")");
  }
  return url;
}
// /Users/mszylkowski/src/amphtml/src/impression.js