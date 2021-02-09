/**
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

import {Deferred} from './utils/promise';
import {Services} from './services';
import {WindowInterface} from './window-interface';
import {
  addParamsToUrl,
  isProxyOrigin,
  parseQueryString,
  parseUrlDeprecated,
} from './url';
import {dev, user, userAssert} from './log';
import {getMode} from './mode';
import {isExperimentOn} from './experiments';

const TIMEOUT_VALUE = 8000;

let trackImpressionPromise = null;

const DEFAULT_APPEND_URL_PARAM = ['gclid', 'gclsrc'];

/**
 * These domains are trusted with more sensitive viewer operations such as
 * sending impression requests. If you believe your domain should be here,
 * file the issue on GitHub to discuss. The process will be similar
 * (but somewhat more stringent) to the one described in the [3p/README.md](
 * https://github.com/ampproject/amphtml/blob/master/3p/README.md)
 *
 * @type {!Array<!RegExp>}
 */
const TRUSTED_REFERRER_HOSTS = [
  /**
   * Twitter's link wrapper domains:
   * - t.co
   */
  /^t.co$/,
];

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
  const deferred = new Deferred();
  const {promise, resolve: resolveImpression} = deferred;

  trackImpressionPromise = Services.timerFor(win)
    .timeoutPromise(TIMEOUT_VALUE, promise, 'TrackImpressionPromise timeout')
    .catch((error) => {
      dev().warn('IMPRESSION', error);
    });

  const viewer = Services.viewerForDoc(win.document.documentElement);
  const isTrustedViewerPromise = viewer.isTrustedViewer();
  const isTrustedReferrerPromise = viewer
    .getReferrerUrl()
    .then((referrer) => isTrustedReferrer(referrer));
  Promise.all([isTrustedViewerPromise, isTrustedReferrerPromise]).then(
    (results) => {
      const isTrustedViewer = results[0];
      const isTrustedReferrer = results[1];
      // Enable the feature in the case of trusted viewer,
      // or trusted referrer
      // or with experiment turned on
      if (
        !isTrustedViewer &&
        !isTrustedReferrer &&
        !isExperimentOn(win, 'alp')
      ) {
        resolveImpression();
        return;
      }

      const replaceUrlPromise = handleReplaceUrl(win);
      const clickUrlPromise = handleClickUrl(win);

      Promise.all([replaceUrlPromise, clickUrlPromise]).then(
        () => {
          resolveImpression();
        },
        () => {}
      );
    }
  );
}

/**
 * Signal that impression tracking is not relevant in this environment.
 */
export function doNotTrackImpression() {
  trackImpressionPromise = Promise.resolve();
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
  const viewer = Services.viewerForDoc(win.document.documentElement);

  // ReplaceUrl substitution doesn't have to wait until the document is visible
  if (!viewer.getParam('replaceUrl')) {
    // The init replaceUrl param serve as a signal on whether replaceUrl is
    // required for this doc.
    return Promise.resolve();
  }

  if (!viewer.hasCapability('replaceUrl')) {
    // If Viewer is not capability of providing async replaceUrl, use the legacy
    // init replaceUrl param.
    viewer.replaceUrl(viewer.getParam('replaceUrl') || null);
    return Promise.resolve();
  }

  // request async replaceUrl is viewer support getReplaceUrl.
  return viewer
    .sendMessageAwaitResponse('getReplaceUrl', /* data */ undefined)
    .then(
      (response) => {
        if (!response || typeof response != 'object') {
          dev().warn('IMPRESSION', 'get invalid replaceUrl response');
          return;
        }
        viewer.replaceUrl(response['replaceUrl'] || null);
      },
      (err) => {
        dev().warn('IMPRESSION', 'Error request replaceUrl from viewer', err);
      }
    );
}

/**
 * @param {string} referrer
 * @return {boolean}
 * @visibleForTesting
 */
export function isTrustedReferrer(referrer) {
  const url = parseUrlDeprecated(referrer);
  if (url.protocol != 'https:') {
    return false;
  }
  return TRUSTED_REFERRER_HOSTS.some((th) => th.test(url.hostname));
}

/**
 * Perform the impression request if it has been provided via
 * the click param in the viewer arguments. Returns a promise.
 * @param {!Window} win
 * @return {!Promise}
 */
function handleClickUrl(win) {
  const ampdoc = Services.ampdoc(win.document.documentElement);
  const viewer = Services.viewerForDoc(ampdoc);

  /** @const {?string} */
  const clickUrl = viewer.getParam('click');
  if (!clickUrl) {
    return Promise.resolve();
  }

  if (clickUrl.indexOf('https://') != 0) {
    user().warn(
      'IMPRESSION',
      'click fragment param should start with https://. Found ',
      clickUrl
    );
    return Promise.resolve();
  }

  if (WindowInterface.getLocation(win).hash) {
    // This is typically done using replaceState inside the viewer.
    // If for some reason it failed, get rid of the fragment here to
    // avoid duplicate tracking.
    WindowInterface.getLocation(win).hash = '';
  }

  // TODO(@zhouyx) need test with a real response.
  return ampdoc
    .whenFirstVisible()
    .then(() => {
      return invoke(win, dev().assertString(clickUrl));
    })
    .then((response) => {
      applyResponse(win, response);
    })
    .catch((err) => {
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
  if (getMode().localDev && !getMode().test) {
    clickUrl = 'http://localhost:8000/impression-proxy?url=' + clickUrl;
  }
  return Services.xhrFor(win)
    .fetchJson(clickUrl, {
      credentials: 'include',
    })
    .then((res) => {
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

  const adLocation = response['location'];
  const adTracking = response['tracking_url'];

  // If there is a tracking_url, need to track it
  // Otherwise track the location
  const trackUrl = adTracking || adLocation;

  if (trackUrl && !isProxyOrigin(trackUrl)) {
    // To request the provided trackUrl for tracking purposes.
    new Image().src = trackUrl;
  }

  // Replace the location href params with new location params we get (if any).
  if (adLocation) {
    if (!win.history.replaceState) {
      return;
    }

    const viewer = Services.viewerForDoc(win.document.documentElement);
    const currentHref = WindowInterface.getLocation(win).href;
    const url = parseUrlDeprecated(adLocation);
    const params = parseQueryString(url.search);
    const newHref = addParamsToUrl(currentHref, params);
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
  return ampdoc.whenReady().then(() => {
    return !!ampdoc
      .getBody()
      .querySelector('amp-analytics[type=googleanalytics]');
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
  const url = parseUrlDeprecated(WindowInterface.getLocation(win).href);
  const params = parseQueryString(url.search);
  const appendParams = [];
  for (let i = 0; i < DEFAULT_APPEND_URL_PARAM.length; i++) {
    const param = DEFAULT_APPEND_URL_PARAM[i];
    if (typeof params[param] !== 'undefined') {
      appendParams.push(param);
    }
  }

  // Check if the param already exists
  const additionalUrlParams = target.getAttribute('data-amp-addparams');
  let {href} = target;
  if (additionalUrlParams) {
    href = addParamsToUrl(href, parseQueryString(additionalUrlParams));
  }
  const loc = parseUrlDeprecated(href);
  const existParams = parseQueryString(loc.search);
  for (let i = appendParams.length - 1; i >= 0; i--) {
    const param = appendParams[i];
    if (typeof existParams[param] !== 'undefined') {
      appendParams.splice(i, 1);
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
  let url = '';
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    url +=
      i == 0
        ? `${param}=QUERY_PARAM(${param})`
        : `&${param}=QUERY_PARAM(${param})`;
  }
  return url;
}
