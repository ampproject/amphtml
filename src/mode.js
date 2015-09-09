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


/**
 * @typedef {{
 *   localDev: boolean
 * }}
 */
var Mode;

/** @typedef {?Mode} */
var mode = null;

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
 * Provides info about the current app.
 * @return {!Mode}
 */
function getMode_() {
  var isLocalDev = (location.hostname == 'localhost' ||
      (location.ancestorOrigins &&
          location.ancestorOrigins[0].startsWith('http://localhost:'))) &&
      // Filter out localhost running against a prod script.
      // Because all allowed scripts are ours, we know that these can only
      // occur during local dev.
      !!document.querySelector('script[src*="/dist/"],script[src*="/base/"]');

  return {
    localDev: isLocalDev,
    // Triggers validation
    development: !!document.querySelector('script[development]')
  };
}
