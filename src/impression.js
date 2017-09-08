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

import {dev, user} from './log';
import {isExperimentOn} from './experiments';
import {Services} from './services';
import {
  isProxyOrigin,
  parseUrl,
  parseQueryString,
  addParamsToUrl,
} from './url';
import {getMode} from './mode';

const TIMEOUT_VALUE = 8000;

let trackImpressionPromise = null;

/**
 * A function to get the trackImpressionPromise;
 * @return {!Promise}
 */
export function getTrackImpressionPromise() {
  return dev().assert(trackImpressionPromise);
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
  let resolveImpression;

  trackImpressionPromise = new Promise(resolve => {
    resolveImpression = resolve;
  });

  const viewer = Services.viewerForDoc(win.document);
  viewer.isTrustedViewer().then(isTrusted => {
    // Currently this feature is launched for trusted viewer, but still
    // experiment guarded for all AMP docs.
    if (!isTrusted && !isExperimentOn(win, 'alp')) {
      resolveImpression();
      return;
    }

    trackImpressionFromClickParam(win, viewer, resolveImpression);
  });
}


/**
 * Actually perform the impression request if it has been provided via
 * the click param in the viewer arguments.
 * @param {!Window} win
 * @param {!./service/viewer-impl.Viewer} viewer
 * @param {!Function} resolveImpression Call when the impression has been
 *     tracked.
 */
function trackImpressionFromClickParam(win, viewer, resolveImpression) {
  /** @const {string|undefined} */
  const clickUrl = viewer.getParam('click');

  if (!clickUrl) {
    resolveImpression();
    return;
  }
  if (clickUrl.indexOf('https://') != 0) {
    user().warn('IMPRESSION',
        'click fragment param should start with https://. Found ',
        clickUrl);
    resolveImpression();
    return;
  }
  if (win.location.hash) {
    // This is typically done using replaceState inside the viewer.
    // If for some reason it failed, get rid of the fragment here to
    // avoid duplicate tracking.
    win.location.hash = '';
  }

  viewer.whenFirstVisible().then(() => {
    // TODO(@zhouyx) need test with a real response.
    const promise = invoke(win, dev().assertString(clickUrl)).then(response => {
      applyResponse(win, viewer, response);
    });

    // Timeout invoke promise after 8s and resolve trackImpressionPromise.
    resolveImpression(Services.timerFor(win).timeoutPromise(TIMEOUT_VALUE,
        promise, 'timeout waiting for ad server response').catch(() => {}));
  });
}

/**
 * Signal that impression tracking is not relevant in this environment.
 */
export function doNotTrackImpression() {
  trackImpressionPromise = Promise.resolve();
}

/**
 * Send the url to ad server and wait for its response
 * @param {!Window} win
 * @param {string} clickUrl
 * @return {!Promise<!JsonObject>}
 */
function invoke(win, clickUrl) {
  if (getMode().localDev && !getMode().test) {
    clickUrl = 'http://localhost:8000/impression-proxy?url=' + clickUrl;
  }
  return Services.xhrFor(win).fetchJson(clickUrl, {
    credentials: 'include',
  }).then(res => res.json());
}

/**
 * parse the response back from ad server
 * Set for analytics purposes
 * @param {!Window} win
 * @param {!JsonObject} response
 */
function applyResponse(win, viewer, response) {
  const adLocation = response['location'];
  const adTracking = response['tracking_url'];

  // If there is a tracking_url, need to track it
  // Otherwise track the location
  const trackUrl = adTracking || adLocation;

  if (trackUrl && !isProxyOrigin(trackUrl)) {
    // To request the provided trackUrl for tracking purposes.
    new Image().src = trackUrl;
  }

  // Replace the location href params with new location params we get.
  if (adLocation) {
    if (!win.history.replaceState) {
      return;
    }
    const currentHref = win.location.href;
    const url = parseUrl(adLocation);
    const params = parseQueryString(url.search);
    const newHref = addParamsToUrl(currentHref, params);
    win.history.replaceState(null, '', newHref);
  }
}
