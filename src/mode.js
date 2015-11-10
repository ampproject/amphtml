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

import {parseQueryString} from './url';


/**
 * @typedef {{
 *   localDev: boolean
 * }}
 */
let Mode;

/** @typedef {?Mode} */
let mode = null;

/**
 * Provides info about the current app.
 * @return {!Mode}
 */
export function getMode() {
  if (mode) {
    return mode;
  }
  return mode = getMode_();
}

/**
 * Set mode in a test. Pass null in afterEach function to reset.
 * @param {?Mode} m
 */
export function setModeForTesting(m) {
  mode = m;
}

/**
 * Provides info about the current app.
 * @return {!Mode}
 */
function getMode_() {
  const isLocalDev = (location.hostname == 'localhost' ||
      (location.ancestorOrigins && location.ancestorOrigins[0] &&
          location.ancestorOrigins[0].indexOf('http://localhost:') == 0)) &&
      // Filter out localhost running against a prod script.
      // Because all allowed scripts are ours, we know that these can only
      // occur during local dev.
      !!document.querySelector('script[src*="/dist/"],script[src*="/base/"]');

  const overrideDevelopment = parseQueryString(location.hash)['development'];
  const development = overrideDevelopment != undefined
      ? overrideDevelopment == '1'
      : !!document.querySelector('script[development]');

  return {
    localDev: isLocalDev,
    // Triggers validation
    development: development,
    minified: process.env.NODE_ENV == 'production',
    test: window.AMP_TEST
  };
}
