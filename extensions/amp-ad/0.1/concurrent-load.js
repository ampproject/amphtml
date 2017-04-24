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

import {timerFor} from '../../../src/services';

/**
 * Store loading ads info within window to ensure it can be properly stored
 * across separately compiled binaries that share load throttling.
 * @const ID of window variable used to track 3p ads waiting to load.
 */
const LOADING_ADS_WIN_ID_ = '3pla';

/**
 * @param {!Window} win
 * @return {boolean} Whether 3p is currently throttled.
 */
export function is3pThrottled(win) {
  return !!win[LOADING_ADS_WIN_ID_];
}

/**
 * @param {!Element} element
 * @return {?number} number if explicit value should be used otherwise super
 *    default should be used.
 */
export function getAmpAdRenderOutsideViewport(element) {
  // Ad opts into lazier loading strategy where we only load ads that are
  // at closer than 1.25 viewports away.
  if (element.getAttribute('data-loading-strategy') ==
      'prefer-viewability-over-views') {
    return 1.25;
  }
  return null;
}

/**
 * Increments loading ads count for throttling.
 * @param {!Window} win
 */
export function incrementLoadingAds(win) {
  if (win[LOADING_ADS_WIN_ID_] === undefined) {
    win[LOADING_ADS_WIN_ID_] = 0;
  }
  win[LOADING_ADS_WIN_ID_]++;
  timerFor(win).delay(() => {
    // Unfortunately we don't really have a good way to measure how long it
    // takes to load an ad, so we'll just pretend it takes 1 second for
    // now.
    win[LOADING_ADS_WIN_ID_]--;
  }, 1000);
}
