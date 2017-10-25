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

import {user} from '../../../src/log';

/**
 * Returns millis as number if given a string(e.g. 1s, 200ms etc)
 * @param {string} time
 * @return {number|undefined}
 */
export function timeStrToMillis(time) {
  const match = time.toLowerCase().match(/^([0-9\.]+)\s*(s|ms)$/);
  if (!match) {
    return NaN;
  }

  const num = match[1];
  const units = match[2];

  user().assert(
      match &&
          match.length == 3 &&
          (units == 's' || units == 'ms'),
      'Invalid time string %s', time);

  return units == 's' ? parseFloat(num) * 1000 : parseInt(num, 10);
}

