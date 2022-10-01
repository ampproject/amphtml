/* Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from '#core/data-structures/promise';

import {Services} from '#service';

import {user, userAssert} from '#utils/log';

/**
 * Store loading ads info within window to ensure it can be properly stored
 * across separately compiled binaries that share load throttling.
 * @const ID of window variable used to track 3p ads waiting to load.
 */
const LOADING_ADS_WIN_ID_ = '3pla';

/** @private {?Promise} resolves when no 3p throttle */
let throttlePromise_ = null;
/** @private {?Function} resolver for throttle promise */
let throttlePromiseResolver_ = null;

/**
 * @param {!Window} win
 * @return {boolean} Whether 3p is currently throttled.
 */
export function is3pThrottled(win) {
  return !!win[LOADING_ADS_WIN_ID_];
}

/** @return {!Promise} resolves when no 3p throttle */
export function waitFor3pThrottle() {
  return throttlePromise_ || Promise.resolve();
}

/**
 * @param {!Element} element
 * @return {?number} number if explicit value should be used otherwise super
 *    default should be used.
 */
export function getAmpAdRenderOutsideViewport(element) {
  const rawValue = element.getAttribute('data-loading-strategy');
  if (rawValue == null) {
    return null;
  }
  // Ad opts into lazier loading strategy where we only load ads that are
  // at closer given number of viewports away.
  if (rawValue == 'prefer-viewability-over-views' || rawValue == '') {
    return 1.25;
  }
  const errorMessage =
    'Value of data-loading-strategy should be a float number in range ' +
    'of [0, 3], but got ' +
    rawValue;
  const viewportNumber = user().assertNumber(
    parseFloat(rawValue),
    errorMessage
  );
  userAssert(viewportNumber >= 0 && viewportNumber <= 3, errorMessage);
  return viewportNumber;
}

/**
 * Increments loading ads count for throttling.
 * @param {!Window} win
 * @param {!Promise=} opt_loadingPromise
 */
export function incrementLoadingAds(win, opt_loadingPromise) {
  if (win[LOADING_ADS_WIN_ID_] === undefined) {
    win[LOADING_ADS_WIN_ID_] = 0;
  }
  win[LOADING_ADS_WIN_ID_]++;

  if (!throttlePromise_) {
    const deferred = new Deferred();
    throttlePromise_ = deferred.promise;
    throttlePromiseResolver_ = deferred.resolve;
  }

  Services.timerFor(win)
    .timeoutPromise(1000, opt_loadingPromise)
    .catch(() => {})
    .then(() => {
      if (!--win[LOADING_ADS_WIN_ID_]) {
        throttlePromiseResolver_();
        throttlePromise_ = null;
        throttlePromiseResolver_ = null;
      }
    });
}
