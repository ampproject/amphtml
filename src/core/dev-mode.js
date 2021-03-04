/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

// Magic constant that is replaced by babel when `gulp dist` is called without
// the --fortesting flag.
const IS_DEV = true;

/**
 * Returns true if the `development` query param is present with any value.
 * @private
 * @visibleForTesting
 * @param location {!Location}
 * @param hash
 * @return {boolean}
 */
export function isDevQueryParamPresent_(location) {
  return (
    'development' in
    parseQueryString(
      // location.originalHash is set by the viewer when it removes the fragment
      // from the URL.
      location.originalHash || location.hash
    )
  );
}

/**
 * Returns true for local development or when the `development` query param
 * is present in the URL.
 * @param win
 * @return {boolean}
 */
export function isDevMode(win = window) {
  return IS_DEV || isDevQueryParamPresent_(win.location);
}
