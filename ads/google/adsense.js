/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getAdsenseInfo, adsenseRequestURLForAmpAd} from './utils';
import {checkData} from '../../3p/3p';

/**
 * Make an adsense iframe.
 * @param {!Window} global
 * @param {!Object} data
 */
export function adsense(global, data) {
  // Placeholder for experiment framework.
  if (!global.context.experiment) {
    adsenseDirectRequest(global, data);
    return;
  }
  checkData(data, ['adClient', 'adSlot', 'adHost', 'adtest', 'tagOrigin']);
  if (global.context.clientId) {
    // Read by GPT for GA/GPT integration.
    global.gaGlobal = {
      vid: global.context.clientId,
      hid: global.context.pageViewId,
    };
  }
  const s = global.document.createElement('script');
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  global.document.body.appendChild(s);

  const i = global.document.createElement('ins');
  i.setAttribute('data-ad-client', data['adClient']);
  if (data['adSlot']) {
    i.setAttribute('data-ad-slot', data['adSlot']);
  }
  if (data['adHost']) {
    i.setAttribute('data-ad-host', data['adHost']);
  }
  if ('adtest' in data && data['adtest'] != null) {
    i.setAttribute('data-adtest', data['adtest']);
  }
  if (data['tagOrigin']) {
    i.setAttribute('data-tag-origin', data['tagOrigin']);
  }
  i.setAttribute('data-page-url', global.context.canonicalUrl);
  i.setAttribute('class', 'adsbygoogle');
  i.style.cssText = 'display:inline-block;width:100%;height:100%;';
  global.document.getElementById('c').appendChild(i);
  (global.adsbygoogle = global.adsbygoogle || []).push({});
}


/**
 * Make the ad iframe, with src=<the ad request>
 * This makes the request directly, rather than using adsbygoogle.js.
 * @param {!Window} global
 * @param {!Object} data
 */
function adsenseDirectRequest(global, data) {
  checkData(data, ['adClient', 'adSlot', 'adHost', 'adtest', 'tagOrigin']);
  if (global.context.clientId) {
    // Read by GPT for GA/GPT integration.
    global.gaGlobal = {
      vid: global.context.clientId,
      hid: global.context.pageViewId,
    };
  }

  const adsenseInfo = getAdsenseInfo(global.context.master);
  const slotNumber = adsenseInfo.nextSlotNumber();
  makeAdsenseAd(global, data, slotNumber, global.context.initialIntersection);
}

/**
 * Make an ad request.
 * @param {!Window} global
 * @param {!Object} data
 * @param {number} slotNumber
 * @param {!IntersectionObserverEntry} change
 * @return {string}
 */
function makeAdsenseAd(global, data, slotNumber, change) {
  const iframe = global.document.createElement('iframe');
  const id = `google_ads_frame${slotNumber}`;
  iframe.name = id;
  iframe.id = id;

  const slot = change.boundingClientRect;
  // iframe.ampLocation = parseUrl(src);
  iframe.width = slot.width;
  iframe.height = slot.height;
  iframe.style.border = 'none';
  iframe.setAttribute('scrolling', 'no');
  iframe.onload = function() {
    // Chrome does not reflect the iframe readystate.
    this.readyState = 'complete';
  };

  iframe.src = adsenseRequestURLForAmpAd(slotNumber, global, data, change);

  global.document.getElementById('c').appendChild(iframe);
}
