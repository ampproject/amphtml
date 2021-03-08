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
import {isLocalDevMode} from './local-dev-mode';
import {isTestingMode} from './testing-mode';
import {parseQueryString} from '../url';

/**
 * Returns true if the `#development` has param has any value set.
 * @private
 * @param {!Location} location
 * @return {boolean}
 */
function isDevQueryParamPresent_(location) {
  return !!parseQueryString(
    // location.originalHash is set by the viewer when it removes the fragment
    // from the URL.
    location.originalHash || location.hash
  )['development'];
}

/**
 * Returns true for local development environments, testing environments, or
 * when the `#development` hash query param has a truthy value in the URL.
 *
 * If you're not sure what to use to check "Is this non-production environment?"
 * use this one.
 *
 * @param {?Window=} opt_win
 * @return {boolean}
 */
export function isDevMode(opt_win = window) {
  return (
    isLocalDevMode() ||
    isTestingMode(opt_win) ||
    isDevQueryParamPresent_(opt_win.location)
  );
}
