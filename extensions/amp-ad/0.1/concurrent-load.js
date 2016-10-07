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

import {timerFor} from '../../../src/timer';

/**
 * Store loading ads info within window to ensure it can be properly stored
 * across separately compiled binaries that share load throttling.
 * @const ID of window variable used to track 3p ads waiting to load.
 */
const LOADING_ADS_WIN_ID_ = '3pla';

/**
 * @param {!Element} element
 * @param {!Window} win
 * @return {number|boolean}
 */
export function allowRenderOutsideViewport(element, win) {
  // Store in window Object that serves as a set of timers associated with
  // waiting elements.
  const loadingAds = win[LOADING_ADS_WIN_ID_] || {};
  // If another ad is currently loading we only load ads that are currently
  // in viewport.
  for (const key in loadingAds) {
    if (Object.prototype.hasOwnProperty.call(loadingAds, key)) {
      return false;
    }
  }

  // Ad opts into lazier loading strategy where we only load ads that are
  // at closer than 1.25 viewports away.
  if (element.getAttribute('data-loading-strategy') ==
      'prefer-viewability-over-views') {
    return 1.25;
  }
  return true;
}

/**
 * Decrements loading ads count used for throttling.
 * @param {number|string} timerId of timer returned from incrementLoadingAds
 * @param {!Window} win
 */
export function decrementLoadingAds(timerId, win) {
  timerFor(win).cancel(timerId);
  const loadingAds = win[LOADING_ADS_WIN_ID_];
  if (loadingAds) {
    delete loadingAds[timerId];
  }
}

/**
 * Increments loading ads count for throttling.
 * @param {!Window} win
 * @return {number|string} timer ID for testing
 */
export function incrementLoadingAds(win) {
  let loadingAds = win[LOADING_ADS_WIN_ID_];
  if (!loadingAds) {
    loadingAds = {};
    win[LOADING_ADS_WIN_ID_] = loadingAds;
  }

  /** @const {number|string} */
  const timerId = timerFor(win).delay(() => {
    // Unfortunately we don't really have a good way to measure how long it
    // takes to load an ad, so we'll just pretend it takes 1 second for
    // now.
    decrementLoadingAds(timerId, win);
  }, 1000);
  loadingAds[timerId] = 1;
  return timerId;
}
