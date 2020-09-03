/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {getCookie} from '../../../src/cookies';
import {getMode} from '../../../src/mode';
import {isInFie} from '../../../src/iframe-helper';
import {isProxyOrigin} from '../../../src/url';

/**
 * COOKIE macro resolver
 * @param {!Window} win
 * @param {!Element} element
 * @param {string} name
 * @return {?string}
 */
export function cookieReader(win, element, name) {
  if (!isCookieAllowed(win, element)) {
    return null;
  }
  return getCookie(win, name);
}

/**
 * Determine if cookie writing/reading feature is supported in current
 * environment.
 * Disable cookie writer in friendly iframe and proxy origin and inabox.
 * @param {!Window} win
 * @param {!Element} element
 * @return {boolean}
 */
export function isCookieAllowed(win, element) {
  return (
    !isInFie(element) &&
    !isProxyOrigin(win.location) &&
    !(getMode(win).runtime == 'inabox')
  );
}
