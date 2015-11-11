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
 * Returns the value of the cookie. The cookie access is restricted and must
 * go through the privacy review. Before using this method please file a
 * GitHub issue with "Privacy Review" label.
 *
 * Returns the cookie's value or `null`.
 *
 * @param {!Window} win
 * @param {string} name
 * @return {?string}
 */
export function getCookie(win, name) {
  const cookieString = win.document.cookie;
  if (!cookieString) {
    return null;
  }
  const cookies = cookieString.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const eq = cookie.indexOf('=');
    if (eq == -1) {
      continue;
    }
    if (decodeURIComponent(cookie.substring(0, eq).trim()) == name) {
      return decodeURIComponent(cookie.substring(eq + 1).trim());
    }
  }
  return null;
}
