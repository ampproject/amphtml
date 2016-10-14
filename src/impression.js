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

import {user} from './log';
import {isExperimentOn} from './experiments';
import {viewerForDoc} from './viewer';
import {xhrFor} from './xhr';
import {getMode} from './mode';
import {openWindowDialog} from './dom';


/**
 * Emit a HTTP request to a destination defined on the incoming URL.
 * Protected by experiment.
 * @param {!Window} win
 */
export function maybeTrackImpression(win) {
  if (!isExperimentOn(win, 'alp')) {
    return;
  }

  const viewer = viewerForDoc(win.document);
  /** @const {string|undefined} */
  let clickUrl = viewer.getParam('click');

  // One test clickUrl
  clickUrl = 'https://googleads.g.doubleclick.net/pcs/click?alp=1&xai=AKAOjstvASJmd6-NeoO3ner8FBNJW2w8n-sXMo0Nj5YC_LIY2NQjbNs0CoXQtM9tPi8by4H4bHRpMdB14qgRLctKkBKkh3vpR3m8fvPCzcFZ6HrxvxXUqzP17YJsihcINtRniOfmGFkzIolJ3ccPSPq6oYdJpg5lPeufOrLhtWsNspOsRgMSBFP7zH0l8tgtAb665jHEFmdAMH1vl69BxpqU2Q0ZoGDO_SVBMArlL--2nLOVgQt8om6IdzkcodppT9c&sig=Cg0ArKJSzEJGKs3-NmXNEAE&urlfix=1&adurl=https://cdn.ampproject.org/c/www.nbcnews.com/news/us-news/amp/milwaukee-cop-cars-smashed-torched-after-police-kill-suspect-n630236';
  if (!clickUrl) {
    return;
  }
  if (clickUrl.indexOf('https://') != 0) {
    user().warn('Impression',
        'click fragment param should start with https://. Found ',
        clickUrl);
    return;
  }
  if (win.location.hash) {
    // This is typically done using replaceState inside the viewer.
    // If for some reason it failed, get rid of the fragment here to
    // avoid duplicate tracking.
    win.location.hash = '';
  }

  viewer.whenFirstVisible().then(() => {
    // TODO(@zhouyx) We need a timeout here?
    // TODO(@zhouyx) need test with a real response.
    invoke(win, clickUrl).then(response => {
      if (!response) {
        return;
      }
      applyResponse(win, viewer, response);
    });
  });
}

/**
 * Send the url to ad server and wait for its response
 * @param {!Window} win
 * @param {string} clickUrl
 * @return {!Promise}
 */
function invoke(win, clickUrl) {
  if (getMode().localDev && !getMode().test) {
    clickUrl = 'http://localhost:8000/impression-proxy?url=' + clickUrl;
  }
  return xhrFor(win).fetchJson(clickUrl, {
    credentials: 'include',
    requireAmpResponseSourceOrigin: true,
  });
  // TODO(@cramforce): Do something with the result.
}

/**
 * parse the response back from ad server
 * Set for analytics purposes
 * @param {!Window} win
 * @param {!Object} response
 */
function applyResponse(win, viewer, response) {
  const adLocation = response['location'];

  // If there's a tracking_url, need to redirect to that url.
  const adTrackingUrl = response['tracking_url'];
  if (adTrackingUrl) {
    // TODO(@zhouyx) Confirm we assume the tracking_url is not
    // a cdn.ampproject page, and we don't do viewer redirect
    openWindowDialog(win, adTrackingUrl, '_top');
    return;
  }

  // If adLocation is not an amp page, need to redirect to it.
  if (adLocation && adLocation.indexOf('https://cdn.ampproject.org') != 0) {
    // TODO(@zhouyx) Confirm we assume the tracking_url is not
    // a cdn.ampproject page, and we don't do viewer redirect
    openWindowDialog(win, adLocation, '_top');
    return;
  }

  // If have gclid, or location contains gclid. add it to location hash
  // Set gclid.
  // If provided use it, if not try to find in adLocation from response
  let gclid = response['gclid'];
  if (!gclid) {
    if (adLocation.indexOf('gclid=') > 0) {
      gclid = adLocation.substr(adLocation.indexOf('gclid=') + 6);
    }
  }
  if (gclid) {
    win.location.hash = '#gclid=' + gclid;
  }
}
