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

import {documentStateFor} from '../../src/document-state';
import {getService} from '../../src/service';
import {timer} from '../../src/timer';
import {
  validateExperimentIds,
  parseExperimentIds,
} from '../../src/traffic-experiments';


/**
 * @param {!Window} global
 * @return {number}
 */
export function getCorrelator(global) {
  return getAmpCorrelator(global.context.clientId, global.context.pageViewId);
}

/**
 * @param {?string} clientId
 * @param {string} pageViewId
 * @return {number}
 */
export function getAmpCorrelator(clientId, pageViewId) {
  if (clientId) {
    return pageViewId + (clientId.replace(/\D/g, '') % 1e6) * 1e6;
  } else {
    return pageViewId;
  }
}

/**
 * @param {number} time
 * @param {number} start
 * @return {number|string}
 */
function elapsedTimeWithCeiling(time, start) {
  const duration = time - start;
  if (duration >= 1e6) {
    return 'M';
  } else if (duration >= 0) {
    return duration;
  }
  return '-M';
}

class AdsenseInfo {
  constructor() {
    /** @private {number} */
    this.nextSlotNumber_ = 0;
  }
  /**
   * @return {number}
   */
  nextSlotNumber() {
    return this.nextSlotNumber_++;
  }
}

export function getAdsenseInfo(win) {
  return getService(win, 'adsenseInfo', () => new AdsenseInfo());
}

const SIZE_EXCEPTION_ID = -12245933;

/**
 * @param {number} num Number, non-negative.
 * @param {number} digits Number of digits, max 20.
 * @return {string}
 */
function formatFixedWidthInteger(num, digits) {
  const intPart = String(Math.max(Math.round(num), 0));
  const len = intPart.length;
  digits = Math.min(digits, 20);
  if (len > digits) {
    return '99999999999999999999'.substr(0, digits);
  }
  return '00000000000000000000'.substr(0, digits - len) + intPart;
}

function adKey(slotNumber, slot, viewport, screen) {
  // Assume Nexus 6 screen, if we don't get either a viewport or a screen.
  const viewWidth = viewport ? viewport.width : screen ? screen.width : 1080;
  const viewHeight = viewport ? viewport.height : screen ? screen.height : 1920;
  const slotTop = slot.y + (viewport ? viewport.y : 0);
  const slotLeft = slot.x + (viewport ? viewport.x : 0);
  return formatFixedWidthInteger(slotNumber, 2) +
    // ad slot top, in 1/5 viewport height units
    formatFixedWidthInteger(slotTop * 5 / viewHeight, 4) +
    // ad slot left, in 1/5 viewport width units
    formatFixedWidthInteger(slotLeft * 5 / viewWidth, 4);
}

/**
 * Make the URL for an ad request, from an amp-ad element.
 * @param {number} slotNumber
 * @param {!Window} global
 * @param {!Object} data
 * @param {!IntersectionObserverEntry} intersectionRecord
 * @return {string}
 */
export function adsenseRequestURLForAmpAd(slotNumber, global, data,
                                          intersectionRecord) {
  // Assumes that data has been checked for valid parameters, via checkData.
  return adsenseRequestURL(global.context.startTime, slotNumber, global,
                           data, 1, global.context.canonicalUrl,
                           getCorrelator(global), intersectionRecord);
}

/**
 * @private {number}
 */
const MAX_URL_LENGTH_ = 4096;

/**
 * @private {number}
 */
const MIN_USEFUL_URL_PARAM_LENGTH_ = '&url=http%3A%2F%2F'.length + 1;

/**
 * @private {string}
 */
const TRUNC_PARAM_ = '&trunc=1';

/**
 * Make the URL for an ad request.
 * @param {number} startTime
 * @param {number} slotNumber
 * @param {!Window} global
 * @param {!Object} data
 * @param {number) isAmp
 * @param {string} canonicalUrl
 * @param {number} correlator
 * @param {!IntersectionObserverEntry} intersectionRecord
 * @return {string}
 */
function adsenseRequestURL(startTime, slotNumber, global, data, isAmp,
                           canonicalUrl, correlator, intersectionRecord) {
  // const lmt = global.document.lastModified;
  const slot = intersectionRecord.boundingClientRect;
  // For this intersectionRecord, root is the viewport.
  const width = slot.width;
  const height = slot.height;
  const viewport = intersectionRecord.rootBounds;
  const screen = global.screen;
  // const fractionInViewport = intersectionRecord.intersectionRatio;
  const visibilityState = documentStateFor(global).getVisibilityState();
  const visNum = {'visible': 1,
                  'hidden': 2,
                  'prerender': 3,
                  // Not returned by getVisibilityState.
                  'preview': 4,
                  // Not expected by ad requests.
                  'unloaded': 0}[visibilityState] || 0;
  const adtest = data['adtest'];
  const adClient = data['adClient'];
  const adSlot = data['adSlot'];
  let experimentIds = null;
  if (data['experimentId'] &&
      validateExperimentIds(parseExperimentIds(data['experimentId']))) {
    experimentIds = data['experimentId'];
  }

  let url = `https://googleads.g.doubleclick.net/pagead/ads?is_amp=${isAmp}` +
    // Protect against wildly long client and slot ids.
    (adClient ? `&client=${encodeURIComponent(adClient.substr(0, 50))}` : '') +
    (adSlot ? `&slotname=${encodeURIComponent(adSlot.substr(0, 50))}` : '') +
    '&d_imp=1&output=html' +
    `&format=${width}x${height}&w=${width}&h=${height}` +
    `&adk=${adKey(slotNumber, slot, viewport, screen)}` +
    // Last modified time.
    // (lmt ? `&lmt=${(Date.parse(lmt) / 1000).toString()}` : '') +
    // An identifier for the page view, used for offline logs analysis.
    `&correlator=${correlator}` +
    // Whether webGL is supported by the browser.
    `&wgl=${global['WebGLRenderingContext'] ? '1' : '0'}` +
    // The datetime of the request. Used to cache-proof URLs and for
    // timing analysis.
    `&dt=${startTime}` +
    // Version of AMP runtime
    '&amp_v=$internalRuntimeVersion$' +
    // Durations used by CSI
    // `&bpp=29&bdt=144&fdt=33&idt=42` +
    // User time zone offset in minutes.
    `&u_tz=${-(new Date).getTimezoneOffset()}` +
    (screen ? `&u_w=${screen.width}&u_h=${screen.height}` +
              `&u_aw=${screen.availWidth}&u_ah=${screen.availHeight}` +
              `&u_cd=${screen.colorDepth}` : '') +
    // Font and size. These require (forbidden) getComputedStyle.
    // `&dff=${}&dfs=16` +
    // Ad slot's x and y coordinates. (slot is relative to viewport.)
    (viewport ? `&adx=${slot.x + viewport.x}&ady=${slot.y + viewport.y}` +
                // Viewport width and height.
                `&biw=${viewport.width}&bih=${viewport.height}` :
                `&adx=${SIZE_EXCEPTION_ID}&ady=${SIZE_EXCEPTION_ID}` +
                `&biw=${SIZE_EXCEPTION_ID}&bih=${SIZE_EXCEPTION_ID}`) +
    // Have to think about how to handle publisher window.
    // `&isw=300&ish=200` +
    // Requires looking outside in the DOM.
    // `&ifk=3286625729` +
    // Resend count.
    // `&rx=0` + `
    // Visibility state.
    `&vis=${visNum}` +
    // Looks at parents, needs getComputedStyle.
    // `&pfx=0` +
    // Browser supports SVG?
    (global.SVGElement && global.document.createElementNS ? '&bc=1' : '') +
    // Unique ID within window.
    `&ifi=${slotNumber}` +
    // Experiment IDs, if any.
    (experimentIds ? `&eid=${experimentIds}` : '');

  let truncated = false;
  const addParameter = (name, value) => {
    if (value != undefined) {
      const newParam = `&${name}=${encodeURIComponent(value)}`;
      if (url.length + newParam.length <= MAX_URL_LENGTH_) {
        url += newParam;
      } else {
        truncated = true;
      }
    }
  };

  const addTruncatableParameter = (name, value, minUsefulLength) => {
    if (value != undefined) {
      const newParam = `&${name}=${encodeURIComponent(value)}`;
      const urlLength = url.length + newParam.length;
      if (urlLength <= MAX_URL_LENGTH_) {
        url += newParam;
      } else {
        // Truncate to fit.
        url = url.substr(
          0, MAX_URL_LENGTH_ - TRUNC_PARAM_.length - url.length);
        // If there is a '%' or '%\w' at the end of the URL then it's likely we've
        // cut an escaped character (e.g. %3B = ;) so remove the whole thing
        // rather than leave it half dangling.
        const truncatedParam = newParam.replace(/%\w?$/, '');
        if (truncatedParam.length >= minUsefulLength) {
          url += truncatedParam;
        }
        truncated = true;
      }
    }
  };

  // Is this a test?
  if (adtest != null) {
    addParameter('adtest', data['adtest']);
  }
  addParameter('u_hist', getHistoryLength_(global));
  addParameter('host', data['adHost']);
  addParameter('to', data['tagOrigin']);

  // The URL to which the ads will be targeted.
  addTruncatableParameter('url', canonicalUrl, MIN_USEFUL_URL_PARAM_LENGTH_);

  addParameter('dtd', elapsedTimeWithCeiling(timer.now(), startTime));

  if (truncated) {
    url += TRUNC_PARAM_;
  }
  return url;
}

/**
 * @param {!Window}
 * @return {number}
 */
function getHistoryLength_(global) {
  // We have seen cases where accessing history length causes errors.
  try {
    return global.history.length;
  } catch (e) {
    return 0;
  }
}
