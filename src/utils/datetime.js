/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
 * Formats seconds to hh:mm:ss or mm:ss (if no hours are needed)
 * @param {number} secs
 * @return {string}
 * @private
 */
export function secsToHHMMSS(secs) {
  let ss = secs;
  const hh = Math.floor(ss / 3600);
  ss %= 3600;
  const mm = Math.floor(ss / 60);
  ss = Math.floor(ss % 60);
  if (hh > 0) {
    return hh + ':' + ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2);
  } else {
    return mm + ':' + ('0' + ss).slice(-2);
  }
}
